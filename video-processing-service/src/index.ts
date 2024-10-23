import express, { Request, Response } from "express";
import { setVideo, VideoProgress } from "./firebase";
import {
  uploadProcessedVideo,
  downloadRawVideo,
  transcodeVideo,
  setupDirectories,
  readQueueMessage,
  handleError,
  finalizeProcessing,
  initializeVideoProcessing,
} from "./storage";
import path from 'path';

// Initialize directories for local processing
setupDirectories();

const app = express();
app.use(express.json());

// Endpoint invoked by pub/sub message when raw video is uploaded to raw g-cloud bucket
app.post("/process-video", async (req: Request, res: Response) => {
  let filename;
  try {
    filename = readQueueMessage(req);
  } catch (err) {
    console.error("Bad Request: Missing filename. Error:", err);
    return handleError(res, err, null, "Reading queue message failed", null, null);
  }

  // <UID>-<DATE>.<EXTENSION> | <FILENAME>.<EXTENSION>
  const inputFileName = path.basename(filename).replace(/[^a-zA-Z0-9.\-_]/g, '');
  const videoIdWithExtension = inputFileName.split('.')[0];
  const videoId = videoIdWithExtension
  const uid = videoId.includes('-') ? videoId.split('-')[0] : videoId;
  const outputFolderName = videoId;

  console.info(`[${videoId}] Initializing video processing...`);
  try {
    await initializeVideoProcessing(videoId, uid);
  } catch (err: any) {
    if (err.message === 'Video is already being processed.') {
      console.info(`[${videoId}] Video is already processing or processed.`);
      return res.status(200).send("Video is already being processed.");
    } else {
      console.error(`[${videoId}] Failed to initialize video processing. Error:`, err);
      return handleError(res, err, videoId, "Initializing video processing failed", inputFileName, outputFolderName);
    }
  }

  console.info(`[${videoId}] Downloading 'raw' video into local directory...`);
  try {
    await setVideo(videoId, { progress: VideoProgress.Downloading });
    await downloadRawVideo(inputFileName);
  } catch (err: unknown) {
    console.error(`[${videoId}] Downloading 'raw' video failed. Error:`, err);
    return handleError(res, err, videoId, "Downloading 'raw' video failed", inputFileName, outputFolderName);
  }

  console.info(`[${videoId}] Starting video transcoding...`);
  try {
    await setVideo(videoId, { progress: VideoProgress.Transcoding });
    await transcodeVideo(inputFileName, outputFolderName);
  } catch (err: unknown) {
    console.error(`[${videoId}] Transcoding failed. Error:`, err);
    return handleError(res, err, videoId, "Transcoding failed", inputFileName, outputFolderName);
  }

  console.info(`[${videoId}] Uploading processed video...`);
  try {
    await setVideo(videoId, { progress: VideoProgress.Uploading });
    await uploadProcessedVideo(outputFolderName);
  } catch (err: unknown) {
    console.error(`[${videoId}] Uploading processed video failed. Error:`, err);
    return handleError(res, err, videoId, "Uploading failed", inputFileName, outputFolderName);
  }

  console.info(`[${videoId}] Finalizing...`);
  try {
    await finalizeProcessing(videoId, inputFileName, outputFolderName);
  } catch (err: unknown) {
    console.error(`[${videoId}] Final processing failed. Error:`, err);
    return handleError(res, err, videoId, "Final processing failed", inputFileName, outputFolderName);
  }

  console.info(`[${videoId}] Video processing successfully completed.`);
  return res.status(200).send("Video processing successfully completed.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
