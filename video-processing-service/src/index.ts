import express from "express";
import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories,
} from "./storage";
import { isVideoNew, setVideo } from "./firebase";

// Create the local directories for videos
setupDirectories();

const app = express();
app.use(express.json());

// Endpoint invoked by pub/sub message to process a video file from Cloud Storage
app.post("/process-video", async (req, res) => {
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

  // Idempotent - safe for pub/sub to repeat requests w/o side effects
  if (!isVideoNew(videoId)) {
    return res
      .status(400)
      .send("Bad Request: video already processing or processed.");
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      status: "processing",
    });
  }

  // Download raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  // Process video into 1080p
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);
    return res.status(500).send("Processing failed");
  }

  // Upload processed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);

  // Change processing status of video in firestore
  await setVideo(videoId, {
    status: "processed",
    filename: outputFileName,
  });

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
