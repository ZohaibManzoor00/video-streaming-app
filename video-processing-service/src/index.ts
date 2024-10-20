import express, { Request, Response } from "express";
import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteLocalRawVideo,
  deleteLocalProcessedVideo,
  convertVideo,
  setupDirectories,
  readQueueMessage,
  handleError,
  deleteLocalVideoFiles,
} from "./storage";

import { isVideoNew, setVideo } from "./firebase";

// Create the local directories for processing locally
setupDirectories();

const app = express();
app.use(express.json());

// Endpoint invoked by pub/sub message when raw video is uploaded Cloud Storage Bucket
app.post("/process-video", async (req: Request, res: Response) => {
  // Get filename from pub/sub message
  let filename;
  try {
    filename = readQueueMessage(req);
  } catch (err) {
    console.log("Bad Request: Missing filename " + err);
    return res.sendStatus(400);
  }

  // <UID>-<DATE>.<EXTENSION> | <FILENAME>.<EXTENSION>
  const inputFileName = filename;
  const videoId = inputFileName.split(".")[0];
  const outputFolderName = videoId;

  console.log("Checking if video is new...");
  if (!(await isVideoNew(videoId))) {
    console.log("Video is already processing or processed");
    return res.sendStatus(200);
  }

  console.log("Writing metadata to firestore...");
  await setVideo(videoId, {
    id: videoId,
    uid: videoId.split("-")[0],
    status: "processing",
    progress: "initializing",
  });

  console.log("Downloading 'raw' video into local directory...");
  try {
    await downloadRawVideo(inputFileName);
  } catch (err: any) {
    await setVideo(videoId, {
      status: "failed",
      progress: "complete",
    });
    await deleteLocalRawVideo(inputFileName);
    console.log(`Downloading failed: ${err.message}`);
    return res.sendStatus(500);
  }

  console.log("Starting Transcoding...");
  try {
    await convertVideo(inputFileName, outputFolderName);
  } catch (err: any) {
    await setVideo(videoId, {
      status: "failed",
      progress: "complete",
    });
    await deleteLocalVideoFiles(inputFileName, outputFolderName);
    console.log(`Transcoding failed: ${err.message}`);
    return res.sendStatus(500);
  }

  console.log("Uploading processed video...");
  try {
    await uploadProcessedVideo(outputFolderName);
  } catch (err: any) {
    await setVideo(videoId, {
      status: "failed",
      progress: "complete",
    });
    await deleteLocalVideoFiles(inputFileName, outputFolderName);
    console.log(`Failed to upload: ${err.message}`);
    return res.sendStatus(500);
  }

  await setVideo(videoId, {
    status: "processed",
    progress: "complete",
  });

  await deleteLocalVideoFiles(inputFileName, outputFolderName);
  console.log("Video transcoding successfully completed");
  res.sendStatus(200);
  // const processedBucket = "marcy-yt-processed-videos";
  // await deleteLocalVideoFiles(inputFileName, outputFolderName);

  // await setVideo(videoId, {
  //   id: videoId,
  //   uid: videoId.split("-")[0],
  //   status: "processed",
  //   progress: "complete",
  //   mpd_url: `https://storage.googleapis.com/${processedBucket}/${outputFolderName}/manifest.mpd`,
  // });

  // return res.sendStatus(200).send("Video processing finished successfully");

  // "mpd_url": `https://storage.googleapis.com/${processedVideoBucketName}/${processedVideoFolder}/output.mpd`,

  // console.log("Uploading...")
  // // Upload processed video to Cloud Storage
  // try {
  //   // await handleVideoProgress(videoId, "processing", "uploading");
  //   await uploadProcessedVideo(outputFolderName);
  // } catch (err) {
  //   return handleError(
  //     res,
  //     err,
  //     videoId,
  //     "Upload failed",
  //     inputFileName,
  //     outputFolderName
  //   );
  // }

  // console.log("Updating Metadata...")
  // // Change processing status in firestore
  // // await handleVideoProgress(videoId, "processed", "complete", outputFileName);
  // await setVideo(videoId, {
  //   id: videoId,
  //   uid: videoId.split("-")[0],
  //   status: "processed",
  //   progress: "complete",
  // });

  // console.log("Deleting local temp files")
  // Delete local temp files
  // await Promise.all([
  //   deleteLocalRawVideo(inputFileName),
  //   deleteLocalProcessedVideo(outputFolderName),
  // ]);

  // await deleteLocalVideoFiles(inputFileName, outputFolderName)

  // return res.status(200).send("Video processing finished successfully");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
