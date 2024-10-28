import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { FieldValue } from "firebase-admin/firestore";

import { firestore, setVideo, Video, VideoProgress, VideoStatus } from "./firebase";
import { cleanup, deleteRawVideoFromBucket, 
    ensureDirectoryExistence, localProcessedPath, localRawPath } from "./storage";

/**
 *  * Initializes video processing by updating Firestore and setting the video status.

 * @param {string} videoId - The unique identifier for the video document in Firestore.
 * @param {string} uid - The user ID associated with the video upload.
 * @returns {Promise<void>} A promise that resolves when the video processing initialization completes.
 * @throws Will throw an error if the video is already being processed or has exceeded the retry limit.
 */
export const initializeVideoProcessing = async (videoId: string, uid: string): Promise<void> => {
  const videoRef = firestore.collection("videos").doc(videoId);
  const maxRetries = 5;

  await firestore.runTransaction(async (transaction) => {
    const videoDoc = await transaction.get(videoRef);
    const data = videoDoc.exists ? videoDoc.data() : {};
    const status = data?.status as VideoStatus | undefined;
    const retryCount = data?.retryCount ?? 0;

    if (status === VideoStatus.Processing || status === VideoStatus.Processed) {
      throw new Error("Video is already being processed or has been completed.");
    }

    if (status === VideoStatus.Failed && retryCount >= maxRetries) {
        const videoData: Partial<Video> = {
            status: VideoStatus.PermanentlyFailed,
            progress: VideoProgress.Complete,
            errorMessage: "Maximum retries reached.",
        };

        await setVideo(videoId, videoData, transaction);
      throw new Error("Video has reached the maximum number of retries.");
    }

    const newRetryCount = status === VideoStatus.Failed ? retryCount + 1 : retryCount;

    const videoData: Partial<Video> = {
      id: videoId, uid,
      status: VideoStatus.Processing,
      progress: VideoProgress.Initializing,
      retryCount: newRetryCount,
      createdAt: FieldValue.serverTimestamp(),
    };

    return await setVideo(videoId, videoData, transaction);
  });
}

/**
 *  * Transcodes a raw video file into multiple resolutions and generates a DASH manifest.
 * 
 * @param rawVideoName - The name of the file to convert from {@link localRawPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export const transcodeVideo = (videoId: string, rawVideoName: string, processedVideoFolder: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const outputFolder = `${localProcessedPath}/${processedVideoFolder}`;
    const inputVideoPath = `${localRawPath}/${rawVideoName}`;

    ensureDirectoryExistence(outputFolder);

    fs.readdirSync(outputFolder).forEach((file) => fs.unlinkSync(`${outputFolder}/${file}`));

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
      .on("progress",(() => {
          let lastPercent = 0;
          return async (progress) => {
            const percent = Math.floor(progress.percent || 0);
            console.log(`FFmpeg processing: ${progress.percent?.toFixed(2)}% done`);

            if (percent - lastPercent >= 5 || percent >= 99) {
              lastPercent = percent;
              try {
                await setVideo(videoId, { transcodingProgress: percent });
              } catch (err) {
                console.error(`Failed to update progress for video ${videoId}:`, err);
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
 *  * Finalizes video processing by updating Firestore, cleaning up local files, and deleting the raw video from the bucket.

 * @param videoId - The ID of the video.
 * @param inputFileName - The name of the raw video file.
 * @param outputFolderName - The name of the local output folder.
 * @returns A promise that resolves when the local folder and raw video contents have been deleted.
 */
export const finalizeProcessing = async (videoId: string, inputFileName: string, outputFolderName: string): Promise<void> => {
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
};
