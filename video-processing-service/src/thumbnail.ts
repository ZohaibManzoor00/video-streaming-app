import { localProcessedPath, localRawPath } from "./storage";
import { setVideo } from "./firebase";

import { spawn } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobe from "ffprobe-client";

/**
 * * Generates a thumbnail image for a video by extracting the first non-black frame.
 * * The thumbnail is saved in the specified output folder as 'thumbnail.jpg'.
 *
 * @param {string} videoId - Name of the input video file.
 * @param {string} filename - Name of the input video file.
 * @param {string} outputFolder - Name of the output folder where the thumbnail will be saved.
 * @returns {Promise<void>} A promise that resolves when the thumbnail has been successfully generated and saved.
 * @throws Will throw an error if thumbnail generation fails.
 */
export const generateThumbnail = async(videoId: string, filename: string, outputFolder: string): Promise<void> => {
  try {
    const inputVideoPath = `${localRawPath}/${filename}`;
    const outputImagePath = `${localProcessedPath}/${outputFolder}/thumbnail.jpg`;
    console.info(`[${videoId}] Finding first non-black frame...`);
    const blackEndTime = await getFirstNonBlackFrameTime(inputVideoPath);
    console.info(`[${videoId}] Extracting video duration...`);
    const videoDuration = await getVideoDuration(inputVideoPath);
    await setVideo(videoId, { duration: videoDuration }); // TODO: Extract duration logic
    let timestamp = blackEndTime + 0.1;
    // Ensure timestamp is within video duration otherwise use middle of the video
    if (timestamp >= videoDuration) timestamp = Math.max(0, videoDuration / 2);
    console.info(`[${videoId}] Extracting thumbnail...`);
    await extractThumbnailAtTime(inputVideoPath, outputImagePath, timestamp);
  } catch (err: unknown) {
    console.error("Error generating thumbnail:", err);
    throw new Error(`Error generating thumbnail: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * * Analyzes video file to determine the timestamp of the first frame that is not black.
 *
 * @param {string} inputVideoPath - Path to the input video file.
 * @returns {Promise<number>} A promise that resolves to the timestamp (in seconds) of the first non-black frame otherwise 0.
 * @throws Will reject the promise if an error occurs during the FFmpeg process.
 */
const getFirstNonBlackFrameTime = (inputVideoPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath.path, ["-i",inputVideoPath,"-vf","blackdetect=d=0.1:pix_th=0.10","-an","-f","null","-",]);

    let stderr = "";
    ffmpegProcess.stderr.on("data", (data) => stderr += data.toString());

    ffmpegProcess.on("close", () => {
      const blackEndMatches = [...stderr.matchAll(/black_end:([\d\.]+)/g)];
      if (blackEndMatches.length > 0) {
        const lastBlackEnd = parseFloat(blackEndMatches[blackEndMatches.length - 1][1]);
        resolve(lastBlackEnd);
      } else {
        resolve(0);
      }
    });

    ffmpegProcess.on("error", (err) => reject(err));
  });
}

/**
 * * Extracts a single frame from a video at a specified timestamp and saves it as an image.
 *
 * @param {string} inputVideoPath - Path to the input video file.
 * @param {string} outputImagePath - Path where the extracted image will be saved.
 * @param {number} timestamp - Timestamp (in seconds) at which to extract the frame.
 * @returns {Promise<void>} A promise that resolves when the image has been successfully saved.
 * @throws Will reject the promise if an error occurs during the FFmpeg process.
 */
const extractThumbnailAtTime = (inputVideoPath: string, outputImagePath: string, timestamp: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .setFfmpegPath(ffmpegPath.path)
      .inputOptions(["-ss", timestamp.toString()])
      .outputOptions(["-frames:v", "1", "-q:v", "2"])
      .output(outputImagePath)
      .on("end", () => resolve())
      .on("error", (err: unknown) => reject(err))
      .run();
  });
}

/**
 * * Retrieves the duration of a video file (seconds).
 *
 * @param {string} inputVideoPath - Path to the input video file.
 * @returns {Promise<number>} A promise that resolves to the duration of the video in seconds.
 * @throws Will reject the promise if an error occurs during the FFprobe process.
 */
const getVideoDuration = async (inputVideoPath: string): Promise<number> => {
  try {
    const metadata = await ffprobe(inputVideoPath);
    const duration = metadata.format.duration;
    if (duration) return parseFloat(duration);
    
    throw new Error("Unable to determine video duration.");
  } catch (err: unknown) {
    throw new Error(`Error getting video duration: ${err instanceof Error ? err.message : err}`);
  }
}
