import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";
import {
  firestore,
  setVideo,
  updateVideo,
  Video,
  VideoProgress,
  VideoStatus,
} from "./firebase";

const storage = new Storage();

const rawBucket = "marcy-yt-raw-videos";
const processedBucket = "marcy-yt-processed-videos";

export const localRawPath = "./raw-videos";
export const localProcessedPath = "./processed-videos";

/**
 * Initializes local directories for raw and processed videos.
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawPath);
  ensureDirectoryExistence(localProcessedPath);
}

/**
 * @param {string} videoId - The unique identifier for the video document in Firestore.
 * @param {string} uid - The user ID associated with the video upload.
 * @returns {Promise<void>} A promise that resolves when the video processing initialization completes.
 * @throws Will throw an error if the video is already being processed or has exceeded the retry limit.
 */
export async function initializeVideoProcessing(
  videoId: string,
  uid: string
): Promise<void> {
  const videoRef = firestore.collection("videos").doc(videoId);
  const maxRetries = 5;

  await firestore.runTransaction(async (transaction) => {
    const videoDoc = await transaction.get(videoRef);
    const data = videoDoc.exists ? videoDoc.data() : {};
    const status = data?.status as VideoStatus | undefined;
    const retryCount = data?.retryCount ?? 0;

    if (status === VideoStatus.Processing || status === VideoStatus.Processed) {
      throw new Error(
        "Video is already being processed or has been completed."
      );
    }

    if (status === VideoStatus.Failed && retryCount >= maxRetries) {
      await setVideo(
        videoId,
        {
          status: VideoStatus.PermanentlyFailed,
          progress: VideoProgress.Complete,
          errorMessage: 'Maximum retries reached during initialization.',
          retryCount,
        },
        transaction
      );

      throw new Error("Video has reached the maximum number of retries.");
    }

    const newRetryCount = status === VideoStatus.Failed ? retryCount + 1 : retryCount;

    const videoData: Video = {
      id: videoId,
      uid: uid,
      status: VideoStatus.Processing,
      progress: VideoProgress.Initializing,
      retryCount: newRetryCount,
    };

    return await setVideo(videoId, videoData, transaction);
  });
}


/**
 * @param rawVideoName - The name of the file to convert from {@link localRawPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function transcodeVideo(
  videoId: string,
  rawVideoName: string,
  processedVideoFolder: string
) {
  return new Promise<void>((resolve, reject) => {
    const outputFolder = `${localProcessedPath}/${processedVideoFolder}`;
    const inputVideoPath = `${localRawPath}/${rawVideoName}`;

    ensureDirectoryExistence(outputFolder);

    fs.readdirSync(outputFolder).forEach((file) =>
      fs.unlinkSync(`${outputFolder}/${file}`)
    );

    const scaleOptions = [
      "scale=640:320",
      "scale=854:480",
      "scale=1280:720",
      "scale=1920:1080",
    ];

    const videoBitrates = ["1500k", "2500k", "5000k", "8000k"];

    const videoCodec = "libx264";
    const x264Options = "keyint=48:min-keyint=48";

    const ffmpegProcess = ffmpeg(inputVideoPath)
      .videoCodec(videoCodec)
      .addOption("-x264opts", x264Options)
      .addOption("-preset", "slow")
      .addOption("-crf", "18")
      .addOption("-g", "48")
      .addOption("-loglevel", "debug");

    scaleOptions.forEach((scale, index) => {
      ffmpegProcess
        .output(`${outputFolder}/video_${index}.mp4`)
        .videoFilters(scale)
        .outputOptions("-b:v", videoBitrates[index])
        .outputOptions("-maxrate", videoBitrates[index])
        .outputOptions(
          "-bufsize",
          `${parseInt(videoBitrates[index], 10) * 2}k`
        );
    });

    ffmpegProcess
      .output(`${outputFolder}/manifest.mpd`)
      .format("dash")
      .addOption("-f", "dash")
      .addOption("-use_template", "1")
      .addOption("-use_timeline", "1")
      .addOption("-seg_duration", "4")
      .addOption("-max_muxing_queue_size", "1024")
      .addOption("-map", "0:v")
      .addOption("-map", "0:a?")
      .on("start", () => console.log("Starting FFmpeg transcoding..."))
      .on(
        "progress",
        (() => {
          let lastPercent = 0;
          return async (progress) => {
            const percent = Math.floor(progress.percent || 0);
            console.log(`FFmpeg processing: ${progress.percent?.toFixed(2)}% done`);

            if (percent - lastPercent >= 5 || percent >= 99) {
              lastPercent = percent;
              try {
                await setVideo(videoId, { transcodingProgress: percent });
              } catch (err) {
                console.error(
                  `Failed to update progress for video ${videoId}:`,
                  err
                );
              }
            }
          };
        })()
      )
      .on("end", async () => {
        console.log("FFmpeg transcoding finished successfully");
        try {
          await setVideo(videoId, { transcodingProgress: 100 });
        } catch (err) {
          console.error(`Failed to update progress for video ${videoId}:`, err);
        }
        resolve();
      })
      .on("error", async (err: any) => {
        console.log("An error occurred during transcoding: " + err.message);
        try {
          await setVideo(videoId, { transcodingProgress: 0 });
        } catch (err) {
          console.error(`Failed to update progress for video ${videoId}:`, err);
        }
        reject(err);
      })
      .run();
  });
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawBucket} bucket into the {@link localRawPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  try {
    await storage
      .bucket(rawBucket)
      .file(fileName)
      .download({ destination: `${localRawPath}/${fileName}` });

    console.info(`gs://${rawBucket}/${fileName} downloaded to ${localRawPath}/${fileName}.`);
  } catch (error: unknown) {
    console.error(
      error instanceof Error
        ? `Error ocurred downloading 'raw' video: ${error}`
        : "An unknown error occurred downloading 'raw' video."
    );
    throw error;
  }
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedPath} folder into the {@link processedBucket}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(processedVideoFolder: string) {
  const folderPath = `${localProcessedPath}/${processedVideoFolder}`;
  const bucket = storage.bucket(processedBucket);

  try {
    const files = await fs.promises.readdir(folderPath);
    await Promise.all(files.map(async (file) => await bucket.upload(`${folderPath}/${file}`, { destination: `${processedVideoFolder}/${file}` })));
    const uploadedFiles = files.map((file) => `${processedVideoFolder}/${file}`);

    await Promise.all(uploadedFiles.map((filePath) => bucket.file(filePath).makePublic()));
    console.log("Processed files have been made public.");
  } catch (error: unknown) {
    console.error(
      error instanceof Error
        ? `Error uploading processed video files: ${error}`
        : "An unknown error occurred during upload."
    );
    throw error;
  }
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

/**
 * @param req - The incoming Express request containing the Pub/Sub message.
 * @returns The name of the video file extracted from the Pub/Sub message.
 * @throws Will throw an error if the message payload is invalid or cannot be parsed.
 */
export function readQueueMessage(req: Request) {
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    const data = JSON.parse(message);
    if (!data || !data.name)
      throw new Error("Invalid message payload received.");
    return data.name;
  } catch (err: any) {
    console.error(err);
    throw new Error(`Bad Request: ${err.message}`);
  }
}

/**
 * Cleans up local files related to video processing.
 *
 * @param inputFileName - The name of the raw video file to delete.
 * @param outputFolderName - The name of the local folder containing processed video files.
 * @returns A promise that resolves when all cleanup tasks are completed.
 */
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
  const results = await Promise.allSettled([
    setVideo(videoId, {
      status: VideoStatus.Processed,
      progress: VideoProgress.Complete,
    }),
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
  if (!videoId) {
    console.error(
      `Video ID is missing. Cannot update video status. ${statusMessage}: ${
        err instanceof Error ? err.message : 'An unknown error occurred.'
      }`
    );
    return res.sendStatus(500);
  }

  try {
    const videoRef = firestore.collection('videos').doc(videoId);
    const videoDoc = await videoRef.get();
    const currentData = videoDoc.data() || {};
    const retryCount = (currentData.retryCount ?? 0) + 1;
    const maxRetries = 5;

    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';

    let statusUpdate: Partial<Video>;

    statusUpdate = {
      status: retryCount >= maxRetries ? VideoStatus.PermanentlyFailed : VideoStatus.Failed,
      progress: VideoProgress.Complete,
      retryCount,
      errorMessage,
    };

    await setVideo(videoId, statusUpdate);

    if (inputFileName && outputFolderName) await cleanup(inputFileName, outputFolderName);

    const logMessage = `[${videoId}] ${statusMessage}: ${errorMessage}`;
    console.error(logMessage);

    if (retryCount >= maxRetries) return res.status(200).send('Video has reached the maximum number of retries.');
      
    return res.sendStatus(500);
  } catch (handleErr) {
    console.error(
      `Error in handleError for video ${videoId}: ${
        handleErr instanceof Error ? handleErr.message : 'An unknown error occurred.'
      }. Original error: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`
    );

    try {
      await setVideo(videoId, {
        status: VideoStatus.PermanentlyFailed,
        progress: VideoProgress.Complete,
        errorMessage: 'Error in handleError: ' + (handleErr instanceof Error ? handleErr.message : 'Unknown error'),
      });
    } catch (finalFallbackErr) {
      console.error(
        `Failed to mark video as PermanentlyFailed for video ${videoId}: ${
          finalFallbackErr instanceof Error ? finalFallbackErr.message : 'An unknown error occurred.'
        }`
      );
    }

    if (!res.headersSent) return res.status(200).send('An error occurred while handling the error.');
  }
};

