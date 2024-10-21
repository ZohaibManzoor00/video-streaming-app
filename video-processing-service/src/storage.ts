import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";
import { updateVideo } from "./firebase";

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
 * @param rawVideoName - The name of the file to convert from {@link localRawPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedPath}.
 * @returns A promise that resolves when the video has been converted.
 */
//     ffmpeg(`${localRawPath}/${rawVideoName}`)
//       .outputOptions(
//         "-vf",
//         "scale=trunc(oh*a/2)*2:1080", // Scaling to 1080p
//         "-preset",
//         "veryfast", // Faster preset
//         "-threads",
//         "0" // Multi-threading
//       )
// export function convertVideo(
//   rawVideoName: string,
//   processedVideoFolder: string
// ) {
//   return new Promise<void>((resolve, reject) => {
//     /**
//      * processed-videos (FOLDER)
//      *    processed-videoID (FOLDER)
//      *      manifest.mpd
//      */
//     const outputFolder = `${localProcessedPath}/${processedVideoFolder}`;
//     const scaleOptions = [
//       "scale=640:320",
//       "scale=854:480",
//       "scale=1280:720",
//       "scale=1920:1080",
//     ];

//     const videoCodec = "libx264";
//     const x264Options = "keyint=24:min-keyint=24:no-scenecut";
//     const videoBitrates = ["500k", "1000k", "2000k", "4000k"];

//     ffmpeg(`${localRawPath}/${rawVideoName}`)
//       .videoFilters(scaleOptions)
//       .videoCodec(videoCodec)
//       .addOption("-x264opts", x264Options)
//       .outputOptions("-b:v", videoBitrates[0])
//       .format("dash")
//       .output(`${outputFolder}/manifest.mpd`)
//       .on("start", () => console.log("Starting transcoding..."))
//       .on("progress", (progress) => {
//         console.log(`FFmpeg processing: ${progress.percent?.toFixed(2)}% done`);
//       })
//       .on("end", () => {
//         console.log("FFmpeg transcoding finished successfully");
//         resolve();
//       })
//       .on("error", (err: any) => {
//         console.log("An error occurred while transcoding: " + err.message);
//         reject(err);
//       })
//       .run();
//   });
// }

// export function convertVideo(
//   rawVideoName: string,
//   processedVideoFolder: string
// ) {
//   return new Promise<void>((resolve, reject) => {
//     const outputFolder = `${localProcessedPath}/${processedVideoFolder}`;
//     ensureDirectoryExistence(outputFolder);

//     const scaleOptions = [
//       "scale=640:320",
//       "scale=854:480",
//       "scale=1280:720",
//       "scale=1920:1080",
//     ];

//     const videoCodec = "libx264";
//     const x264Options = "keyint=24:min-keyint=24:no-scenecut";
//     const videoBitrates = ["500k", "1000k", "2000k", "4000k"];

//     // Initialize FFmpeg
//     const ffmpegProcess = ffmpeg(`${localRawPath}/${rawVideoName}`)
//       .videoCodec(videoCodec)
//       .addOption("-x264opts", x264Options)
//       .format("dash");

//     // Add output streams for each resolution and bitrate
//     scaleOptions.forEach((scale, index) => {
//       ffmpegProcess
//         .output(`${outputFolder}/video_${index}.mp4`) // Individual resolution output files
//         .videoFilters(scale)
//         .outputOptions("-b:v", videoBitrates[index]); // Corresponding bitrate
//     });

//     // Generate DASH manifest
//     ffmpegProcess
//       .output(`${outputFolder}/manifest.mpd`)
//       .addOption("-map", "0") // Map all inputs to one manifest
//       .addOption("-loglevel", "verbose")
//       .on("start", () => console.log("Starting transcoding..."))
//       .on("progress", (progress) => {
//         console.log(`FFmpeg processing: ${progress.percent?.toFixed(2)}% done`);
//       })
//       .on("end", () => {
//         console.log("FFmpeg transcoding finished successfully");
//         resolve();
//       })
//       .on("error", (err: any) => {
//         console.log("An error occurred while transcoding: " + err.message);
//         reject(err);
//       })
//       .run();
//   });
// }
// export function convertVideo(
//   rawVideoName: string,
//   processedVideoFolder: string
// ) {
//   return new Promise<void>((resolve, reject) => {
//     // Define paths
//     const outputFolder = `${localProcessedPath}/${processedVideoFolder}`;
//     const inputVideoPath = `${localRawPath}/${rawVideoName}`;
    
//     // Ensure output folder exists
//     ensureDirectoryExistence(outputFolder);

//     // Video resolution and bitrate options
//     const scaleOptions = [
//       "scale=640:320",
//       "scale=854:480",
//       "scale=1280:720",
//       "scale=1920:1080",
//     ];

//     const videoBitrates = ["500k", "1000k", "2000k", "4000k"];

//     const videoCodec = "libx264";
//     const x264Options = "keyint=24:min-keyint=24";

//     // Initialize FFmpeg process
//     const ffmpegProcess = ffmpeg(inputVideoPath)
//       .videoCodec(videoCodec)
//       .addOption("-x264opts", x264Options)
//       .format("dash")  // DASH streaming format
//       .addOption("-loglevel", "verbose")  // Add detailed logging for debugging

//     // Add output streams for each resolution and bitrate
//     scaleOptions.forEach((scale, index) => {
//       ffmpegProcess
//         .output(`${outputFolder}/video_${index}.mp4`)  // Output files for each resolution
//         .videoFilters(scale)  // Apply scaling filter
//         .outputOptions("-b:v", videoBitrates[index]);  // Set corresponding bitrate
//     });

//     // Generate DASH manifest
//     ffmpegProcess
//       .output(`${outputFolder}/manifest.mpd`)  // Output the DASH manifest file
//       .addOption("-map", "0:v")  // Map only the video stream, ignoring audio issues
//       .on("start", () => console.log("Starting FFmpeg transcoding..."))  // Start log
//       .on("progress", (progress) => {
//         console.log(`FFmpeg processing: ${progress.percent?.toFixed(2)}% done`);
//       })
//       .on("end", () => {
//         console.log("FFmpeg transcoding finished successfully");
//         resolve();
//       })
//       .on("error", (err: any) => {
//         console.log("An error occurred during transcoding: " + err.message);
//         reject(err);
//       })
//       .run();  // Execute the FFmpeg process
//   });
// }
export function convertVideo(
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
    fs.readdirSync(outputFolder).forEach(file => {
      fs.unlinkSync(`${outputFolder}/${file}`);
    });

    // Initialize FFmpeg process
    const ffmpegProcess = ffmpeg(inputVideoPath)
      .videoCodec(videoCodec)
      .addOption("-x264opts", x264Options)
      .addOption("-preset", "slow")  // Slower encoding for better quality
      .addOption("-crf", "18")  // Lower CRF for higher quality
      .addOption("-g", "48")  // Set GOP size for more frequent keyframes
      .addOption("-loglevel", "debug");  // Detailed logging for debugging

    // Add output streams for each resolution and bitrate
    scaleOptions.forEach((scale, index) => {
      ffmpegProcess
        .output(`${outputFolder}/video_${index}.mp4`)  // Output files for each resolution
        .videoFilters(scale)  // Apply scaling filter
        .outputOptions("-b:v", videoBitrates[index])  // Set corresponding bitrate
        .outputOptions("-maxrate", videoBitrates[index])
        .outputOptions("-bufsize", `${parseInt(videoBitrates[index], 10) * 2}k`);
    });

    // Generate DASH manifest
    ffmpegProcess
      .output(`${outputFolder}/manifest.mpd`)  // Output the DASH manifest file
      .format('dash')  // Explicitly set output format for the manifest
      .addOption("-f", "dash")
      .addOption("-use_template", "1")  // Enable template-based segment naming
      .addOption("-use_timeline", "1")  // Enable timeline-based segmenting
      .addOption("-seg_duration", "4")  // Segment duration in seconds
      .addOption("-max_muxing_queue_size", "1024")  // Prevent buffer errors
      .addOption("-map", "0:v")  // Map all video streams
      .addOption("-map", "0:a?")  // Optionally map audio if present
      .on("start", () => console.log("Starting FFmpeg transcoding..."))  // Start log
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
      .run();  // Execute the FFmpeg process
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
// export async function uploadProcessedVideo(fileName: string) {
//   const bucket = storage.bucket(processedBucket);

//   // Upload video to the bucket
//   await storage
//     .bucket(processedBucket)
//     .upload(`${localProcessedPath}/${fileName}`, {
//       destination: fileName,
//     });
//   console.log(
//     `${localProcessedPath}/${fileName} uploaded to gs://${processedBucket}/${fileName}.`
//   );

//   // Set the video to be publicly readable
//   await bucket.file(fileName).makePublic();
// }
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
  console.log("All files have been made public.");
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

export async function deleteLocalVideoFiles(
  rawFilename: string,
  processedFolder: string
) {
  await Promise.all([
    deleteLocalRawVideo(rawFilename),
    deleteLocalProcessedVideo(processedFolder),
  ]);
}

export function readQueueMessage(req: Request) {
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
    const data = JSON.parse(message);
    if (!data.name) throw new Error('Invalid message payload received.');
    return data.name
  } catch (err: any) {
    console.error(err);
    throw new Error(`Bad Request: ${err.message}`);
  }
}

export const handleError = async (
  res: Response,
  err: any, // TODO: Type specifically
  videoId: string,
  message: string,
  inputFileName: string,
  outputFolderName: string
): Promise<Response> => {
  console.error(message);
  // await updateVideo(videoId, "failed", "complete", outputFolderName);
  await Promise.all([
    deleteLocalRawVideo(inputFileName),
    deleteLocalProcessedVideo(outputFolderName),
  ]).catch((err) => console.error(`Error deleting local video files: ${err}`));
  return res.status(500).send({ message, err });
};
