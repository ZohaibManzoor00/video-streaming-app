import express, { Request, Response } from "express";
import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories,
} from "./storage";

import { handleError, isVideoNew, handleVideoProgress } from "./firebase";

// Create the local directories for processing locally
setupDirectories();

const app = express();
app.use(express.json());

// Endpoint invoked by pub/sub message when raw video is uploaded Cloud Storage Bucket
app.post("/process-video", async (req: Request, res: Response) => {
  // Get bucket and filename from pub/sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send("Bad Request: missing filename.");
  }

  const inputFileName = data.name; // <UID>-<DATE>.<EXTENSION>
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split(".")[0];

  // Idempotent - safe for pub/sub to repeat same request w/o side effects
  if (!(await isVideoNew(videoId))) {
    return res
      .status(400)
      .send("Bad Request: video already processing or processed.");
  }

  await handleVideoProgress(videoId, "processing", "initializing");

  // Download raw video from Cloud Storage
  try {
    await handleVideoProgress(videoId, "processing", "downloading");
    await downloadRawVideo(inputFileName);
  } catch (err) {
    return handleError(
      res,
      videoId,
      "Download failed",
      inputFileName,
      outputFileName
    );
  }

  // Process video into 1080p
  try {
    await handleVideoProgress(videoId, "processing", "processing");
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    return handleError(
      res,
      videoId,
      "Processing failed",
      inputFileName,
      outputFileName
    );
  }

  // Upload processed video to Cloud Storage
  try {
    await handleVideoProgress(videoId, "processing", "uploading");
    await uploadProcessedVideo(outputFileName);
  } catch (err) {
    return handleError(
      res,
      videoId,
      "Upload failed",
      inputFileName,
      outputFileName
    );
  }

  // Change processing status in firestore
  await handleVideoProgress(videoId, "processed", "complete", outputFileName);

  // Delete local temp files
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  return res.status(200).send("Video processing finished successfully");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
