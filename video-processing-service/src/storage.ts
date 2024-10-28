import fs from "fs";
import { Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { firestore, setVideo, Video, VideoProgress, VideoStatus } from "./firebase";

const storage = new Storage();

const rawBucket = "marcy-yt-raw-videos";
const processedBucket = "marcy-yt-processed-videos";

export const localRawPath = "./raw-videos";
export const localProcessedPath = "./processed-videos";

/**
 * * Sets up necessary local directories for video processing.
 */
export const setupDirectories = (): void => {
  ensureDirectoryExistence(localRawPath);
  ensureDirectoryExistence(localProcessedPath);
};

/**
 * * Ensures a directory exists, creating it if necessary.
 *
 * @param {string} dirPath - The directory path to check.
 */
export const ensureDirectoryExistence = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created at ${dirPath}`);
  }
};

/**
 * * Extracts the video file name from a Pub/Sub message.
 *
 * @param req - The incoming Express request containing the Pub/Sub message.
 * @returns The name of the video file extracted from the Pub/Sub message.
 * @throws Will throw an error if the message payload is invalid or cannot be parsed.
 */
export function readQueueMessage(req: Request): string {
  if (!req.body || !req.body.message || !req.body.message.data) {
    throw new Error("Invalid Pub/Sub message format: Missing 'data' field.");
  }

  const messageData = Buffer.from(req.body.message.data, "base64").toString(
    "utf8"
  );

  let data;
  try {
    data = JSON.parse(messageData);
  } catch {
    throw new Error("Invalid Pub/Sub message: Data payload is not valid JSON.");
  }

  if (!data.name) {
    throw new Error(
      "Invalid Pub/Sub message: Missing 'name' field in data payload."
    );
  }

  return data.name;
}

/**
 * * Downloads a raw video file from Google Cloud Storage to the local filesystem.
 *
 * @param fileName - The name of the file to download from the
 * {@link rawBucket} bucket into the {@link localRawPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export const downloadRawVideo = async (fileName: string): Promise<void> => {
  try {
    await storage
      .bucket(rawBucket)
      .file(fileName)
      .download({ destination: `${localRawPath}/${fileName}` });

    console.info(
      `gs://${rawBucket}/${fileName} downloaded to ${localRawPath}/${fileName}.`
    );
  } catch (error: unknown) {
    console.error(
      error instanceof Error
        ? `Error ocurred downloading 'raw' video: ${error}`
        : "An unknown error occurred downloading 'raw' video."
    );
    throw error;
  }
};

/**
 * * Uploads processed video files from the local filesystem to Google Cloud Storage and makes them public.
 *
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedPath} folder into the {@link processedBucket}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export const uploadProcessedVideo = async (processedVideoFolder: string): Promise<void> => {
  const folderPath = `${localProcessedPath}/${processedVideoFolder}`;
  const bucket = storage.bucket(processedBucket);

  try {
    const files = await fs.promises.readdir(folderPath);
    await Promise.all(
      files.map(async (file) => {
        await bucket.upload(`${folderPath}/${file}`, {
          destination: `${processedVideoFolder}/${file}`,
        });
      })
    );

    const uploadedFiles = files.map(
      (file) => `${processedVideoFolder}/${file}`
    );
    await Promise.all(
      uploadedFiles.map((filePath) => bucket.file(filePath).makePublic())
    );
    console.log("Processed files have been made public.");
  } catch (error: unknown) {
    console.error(
      error instanceof Error
        ? `Error uploading processed video files: ${error}`
        : "An unknown error occurred during upload."
    );
    throw error;
  }
};

/**
 * * Deletes a raw video file from the 'raw' Google Cloud Storage bucket.
 *
 * @param fileName - The name of the file to delete from the {@link rawBucket} bucket.
 * @returns A promise that resolves when the file has been deleted.
 */
export const deleteRawVideoFromBucket = async (fileName: string): Promise<void> => {
  await storage.bucket(rawBucket).file(fileName).delete();
};

/**
 * * Executes a function that deletes the raw video file from the local filesystem.
 *
 * @param fileName - The name of the file to delete from the {@link localRawPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */
export const deleteLocalRawVideo = async (fileName: string): Promise<void> => {
  return deleteFile(`${localRawPath}/${fileName}`);
};

/**
 * * Deletes a specific file from the filesystem
 * 
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
const deleteFile = (filePath: string): Promise<void> => {
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
};

/**
 * * Deletes the processed video folder from the local filesystem.
 * 
 * @param folderName - The name of the folder to delete from the {@link localProcessedPath} folder.
 * @returns A promise that resolves when the folder and its content's have been deleted.
 */
export const deleteLocalProcessedVideo = async (folderName: string): Promise<void> => {
  return deleteFolder(`${localProcessedPath}/${folderName}`);
};

/**
 * * Deletes a folder and all its contents (files and subfolders).
 *
 * @param folder - The path of the folder to delete.
 * @returns A promise that resolves when the folder and its contents have been deleted.
 */
const deleteFolder = (folder: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(folder)) {
      fs.rm(folder, { recursive: true }, (err) => {
        if (err) {
          console.error(`Failed to delete folder at ${folder}`, err);
          reject(err);
        } else {
          console.log(`Local processed folder and its contents deleted at ${folder}`);
          resolve();
        }
      });
    } else {
      console.log(`${folder} not found at ${localProcessedPath}, skipping delete.`);
      resolve();
    }
  });
};

/**
 * * Cleans up local files related to video processing.
 *
 * @param inputFileName - The name of the raw video file to delete.
 * @param outputFolderName - The name of the local folder containing processed video files.
 * @returns A promise that resolves when all cleanup tasks are completed.
 */
export const cleanup = async (inputFileName: string, outputFolderName: string): Promise<void> => {
  const res = await Promise.allSettled([
    deleteLocalRawVideo(inputFileName),
    deleteLocalProcessedVideo(outputFolderName),
  ]);

  res.forEach((req, index) => {
    if (req.status === "rejected") {
      console.error(`Cleanup task ${index + 1} failed: ${req.reason}`);
    }
  });
};

/**
 * * Handles errors during video processing, updates the video status, and performs cleanup.
 *
 * @param res - The Express response object used to send the HTTP status code.
 * @param err - The error that occurred, which can be of any type.
 * @param videoId - The unique identifier for the video, or null if not available.
 * @param statusMessage - A message describing the current processing status.
 * @param inputFileName - The name of the input file to clean up, or null if not applicable.
 * @param outputFolderName - The name of the output folder to clean up, or null if not applicable.
 * @returns {Promise<Response>} A promise that resolves to an Express response after handling the error and performing cleanup.
 */
export const handleError = async (
  res: Response,
  err: unknown,
  videoId: string | null,
  statusMessage: string,
  inputFileName: string | null,
  outputFolderName: string | null
): Promise<Response> => {
  if (!videoId) return res.status(200).send("Invalid message received and will not be retried.");

  try {
    const videoRef = firestore.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();
    const currentData = videoDoc.data() || {};
    const retryCount = (currentData.retryCount ?? 0) + 1;
    const maxRetries = 5;

    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";

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

    if (retryCount >= maxRetries) return res.status(200).send("Video has reached the maximum number of retries.");

    return res.sendStatus(500);
  } catch (handleErr) {
    console.error(
      `Error in handleError for video ${videoId}: ${
        handleErr instanceof Error
          ? handleErr.message
          : "An unknown error occurred."
      }. Original error: ${err instanceof Error ? err.message : "An unknown error occurred."}`
    );

    try {
      const videoData: Partial<Video> = {
        status: VideoStatus.PermanentlyFailed, progress: VideoProgress.Complete,
        errorMessage: `Error in handleError: ${handleErr instanceof Error ? handleErr.message : "Unknown error"}`
      }
      await setVideo(videoId, videoData);
    } catch (finalFallbackErr) {
      console.error(
        `Failed to mark video as PermanentlyFailed for video ${videoId}: ${
          finalFallbackErr instanceof Error
            ? finalFallbackErr.message
            : "An unknown error occurred marking video as PermanentlyFailed."
        }`
      );
    }

    if (!res.headersSent) return res.status(200).send("An error occurred while handling the error.");
    else return res;
  }
};
