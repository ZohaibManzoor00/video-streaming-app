import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";
import {
  firestore,
  setVideo,
  updateVideo,
  VideoProgress,
  VideoStatus,
} from "./firebase";

const storage = new Storage();

const rawBucket = "marcy-yt-raw-videos";
const processedBucket = "marcy-yt-processed-videos";

const localRawPath = "./raw-videos";
const localProcessedPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawPath);
  ensureDirectoryExistence(localProcessedPath);
}

/**
 * Initializes the video processing transaction for a given video.
 *
 * @param {string} videoId - The unique identifier for the video document in Firestore.
 * @param {string} uid - The user ID associated with the video upload.
 * @returns {Promise<void>} A promise that resolves when the video processing initialization completes.
 */
export async function initializeVideoProcessing(
  videoId: string,
  uid: string
): Promise<void> {
  const videoRef = firestore.collection("videos").doc(videoId);

  await firestore.runTransaction(async (transaction) => {
    const videoDoc = await transaction.get(videoRef);

    if (videoDoc.exists) {
      const status = videoDoc.data()?.status;
      if (status && status !== "new") {
        throw new Error("Video is already being processed.");
      }
    }

    await setVideo(
      videoId,
      {
        id: videoId,
        uid: uid,
        status: VideoStatus.Processing,
        progress: VideoProgress.Initializing,
      },
      transaction
    );
  });
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function transcodeVideo(
  rawVideoName: string,
  processedVideoFolder: string
) {
  return new Promise<void>((resolve, reject) => {
    // Define paths
    const outputFolder = `${localProcessedPath}/${processedVideoFolder}`;
    const inputVideoPath = `${localRawPath}/${rawVideoName}`;

    // Ensure output folder exists
    ensureDirectoryExistence(outputFolder);

    // Video resolution and bitrate options
    const scaleOptions = [
      "scale=640:320",
      "scale=854:480",
      "scale=1280:720",
      "scale=1920:1080",
    ];

    // Updated bitrates for higher quality
    const videoBitrates = ["1500k", "2500k", "5000k", "8000k"];

    const videoCodec = "libx264";
    const x264Options = "keyint=48:min-keyint=48"; // More frequent keyframes for better quality

    // Clean up previous output files if they exist
    fs.readdirSync(outputFolder).forEach((file) => {
      fs.unlinkSync(`${outputFolder}/${file}`);
    });

    // Initialize FFmpeg process
    const ffmpegProcess = ffmpeg(inputVideoPath)
      .videoCodec(videoCodec)
      .addOption("-x264opts", x264Options)
      .addOption("-preset", "slow") // Slower encoding for better quality
      .addOption("-crf", "18") // Lower CRF for higher quality
      .addOption("-g", "48") // Set GOP size for more frequent keyframes
      .addOption("-loglevel", "debug"); // Detailed logging for debugging

    // Add output streams for each resolution and bitrate
    scaleOptions.forEach((scale, index) => {
      ffmpegProcess
        .output(`${outputFolder}/video_${index}.mp4`) // Output files for each resolution
        .videoFilters(scale) // Apply scaling filter
        .outputOptions("-b:v", videoBitrates[index]) // Set corresponding bitrate
        .outputOptions("-maxrate", videoBitrates[index])
        .outputOptions(
          "-bufsize",
          `${parseInt(videoBitrates[index], 10) * 2}k`
        );
    });

    // Generate DASH manifest
    ffmpegProcess
      .output(`${outputFolder}/manifest.mpd`) // Output the DASH manifest file
      .format("dash") // Explicitly set output format for the manifest
      .addOption("-f", "dash")
      .addOption("-use_template", "1") // Enable template-based segment naming
      .addOption("-use_timeline", "1") // Enable timeline-based segmenting
      .addOption("-seg_duration", "4") // Segment duration in seconds
      .addOption("-max_muxing_queue_size", "1024") // Prevent buffer errors
      .addOption("-map", "0:v") // Map all video streams
      .addOption("-map", "0:a?") // Optionally map audio if present
      .on("start", () => console.log("Starting FFmpeg transcoding...")) // Start log
      .on("progress", (progress) => {
        console.log(`FFmpeg processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on("end", () => {
        console.log("FFmpeg transcoding finished successfully");
        resolve();
      })
      .on("error", (err: any) => {
        console.log("An error occurred during transcoding: " + err.message);
        reject(err);
      })
      .run(); // Execute the FFmpeg process
  });
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawBucket} bucket into the {@link localRawPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  await storage
    .bucket(rawBucket)
    .file(fileName)
    .download({
      destination: `${localRawPath}/${fileName}`,
    });

  console.log(
    `gs://${rawBucket}/${fileName} downloaded to ${localRawPath}/${fileName}.`
  );
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedPath} folder into the {@link processedBucket}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(processedVideoFolder: string) {
  const folderPath = `${localProcessedPath}/${processedVideoFolder}`;
  const bucket = storage.bucket(processedBucket);

  // Upload all files (MPD + segments) in the folder
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    await bucket.upload(`${folderPath}/${file}`, {
      destination: `${processedVideoFolder}/${file}`,
    });
    console.log(
      `${folderPath}/${file} uploaded to gs://${processedBucket}/${processedVideoFolder}/${file}`
    );
  }

  // Set the manifest and segments to be publicly readable
  const uploadedFiles = files.map((file) => `${processedVideoFolder}/${file}`);
  await Promise.all(
    uploadedFiles.map((filePath) => bucket.file(filePath).makePublic())
  );
  console.log("Processed files have been made public.");
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link rawBucket} bucket.
 * @returns A promise that resolves when the file has been deleted.
 */
export async function deleteRawVideoFromBucket(fileName: string) {
  await storage.bucket(rawBucket).file(fileName).delete();

  console.log(`Successfully deleted gs://${rawBucket}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */
export function deleteLocalRawVideo(fileName: string) {
  return deleteFile(`${localRawPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve();
    }
  });
}

/**
 * @param folderName - The name of the folder to delete from the
 * {@link localProcessedPath} folder.
 * @returns A promise that resolves when the folder and its content's have been deleted.
 */
export function deleteLocalProcessedVideo(folderName: string) {
  return deleteFolder(`${localProcessedPath}/${folderName}`);
}

/**
 * Deletes a folder and all its contents (files and subfolders).
 *
 * @param folder - The path of the folder to delete.
 * @returns A promise that resolves when the folder and its contents have been deleted.
 */
function deleteFolder(folder: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(folder)) {
      fs.rm(folder, { recursive: true }, (err) => {
        if (err) {
          console.error(`Failed to delete folder at ${folder}`, err);
          reject(err);
        } else {
          console.log(
            `Local processed folder and its contents deleted at ${folder}`
          );
          resolve();
        }
      });
    } else {
      console.log(
        `${folder} not found at ${localProcessedPath}, skipping delete.`
      );
      resolve();
    }
  });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created at ${dirPath}`);
  }
}

// export async function deleteLocalVideoFiles(
//   rawFilename: string,
//   processedFolder: string
// ) {
//   await Promise.all([
//     deleteLocalRawVideo(rawFilename),
//     deleteLocalProcessedVideo(processedFolder),
//   ]);
// }

export function readQueueMessage(req: Request) {
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    const data = JSON.parse(message);
    if (!data.name) throw new Error("Invalid message payload received.");
    return data.name;
  } catch (err: any) {
    console.error(err);
    throw new Error(`Bad Request: ${err.message}`);
  }
}

export async function cleanup(inputFileName: string, outputFolderName: string) {
  const res = await Promise.allSettled([
    deleteLocalRawVideo(inputFileName),
    deleteLocalProcessedVideo(outputFolderName),
  ]);

  res.forEach((req, index) => {
    if (req.status === "rejected") {
      console.error(`Cleanup task ${index + 1} failed: ${req.reason}`);
    }
  });
}

/**
 * @param videoId - The ID of the video.
 * @param inputFileName - The name of the raw video file.
 * @param outputFolderName - The name of the local output folder.
 */
export async function finalizeProcessing(
  videoId: string,
  inputFileName: string,
  outputFolderName: string
) {
  console.log("Finalizing video processing...");

  const results = await Promise.allSettled([
    setVideo(videoId, { status: VideoStatus.Processed, progress: VideoProgress.Complete }),
    cleanup(inputFileName, outputFolderName),
    deleteRawVideoFromBucket(inputFileName),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Finalization task ${index + 1} failed: ${result.reason}`);
    }
  });
}

/**
 * Handles errors during video processing and performs necessary cleanup.
 * 
 * @param res - The Express response object used to send the HTTP status code.
 * @param err - The error that occurred, which can be of any type.
 * @param videoId - The unique identifier for the video, or null if not available.
 * @param statusMessage - A message describing the current processing status.
 * @param inputFileName - The name of the input file to clean up, or null if not applicable.
 * @param outputFolderName - The name of the output folder to clean up, or null if not applicable.
 * @returns A promise that resolves after handling the error and performing cleanup.
 */
export const handleError = async (
  res: Response,
  err: unknown,
  videoId: string | null,
  statusMessage: string,
  inputFileName: string | null,
  outputFolderName: string | null
) => {
  try {
    if (videoId)
      await setVideo(videoId, {
        status: VideoStatus.Failed,
        progress: VideoProgress.Complete,
      });
    if (inputFileName && outputFolderName)
      await cleanup(inputFileName, outputFolderName);

    if (err instanceof Error) console.log(`${statusMessage}: ${err.message}`);
    else console.error("An unknown error occurred during cleanup.");

    res.sendStatus(500);
  } catch (handleErr) {
    console.error(`Error in handleError: ${handleErr}`);
    // Even if handleError fails, we need to ensure we don't throw unhandled exceptions
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  }
};

