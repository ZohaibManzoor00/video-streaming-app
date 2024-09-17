import { Response } from "express";
import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";
import { deleteProcessedVideo, deleteRawVideo } from "./storage";

initializeApp({ credential: credential.applicationDefault() });
const firestore = new Firestore();
const videoCollectionId = "videos";

type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed" | "failed";
  progress?:
    | "initializing"
    | "downloading"
    | "processing"
    | "uploading"
    | "complete";
};

type Status = Video["status"];
type Progress = Video["progress"];

export const getVideo = async (videoId: string): Promise<Video> => {
  const snapshot = await firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .get();
  return (snapshot.data() as Video) ?? {};
};

export const setVideo = async (
  videoId: string,
  video: Video
): Promise<void> => {
  await firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true });
};

export const isVideoNew = async (videoId: string): Promise<boolean> => {
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  return !snapshot.exists;
};

export const updateVideo = async (
  videoId: string,
  status: Status,
  progress: Progress,
  filename: null | string = null,
) => {
  const updateData: Partial<Video> = { status, progress };
  if (filename) updateData.filename = filename;
  await setVideo(videoId, updateData);
};

export const handleVideoProgress = async (
  videoId: string,
  status: Status,
  progress: Progress,
  filename?: string
) => {
  try {
    await updateVideo(videoId, status, progress, filename);
  } catch (err) {
    console.error(`Failed to update video status: ${err}`);
    throw new Error("Failed to update video status");
  }
};

export const handleError = async (
  res: Response,
  videoId: string,
  message: string,
  inputFileName: string,
  outputFileName: string
): Promise<Response> => {
  console.error(message);
  await updateVideo(videoId, "failed", "complete", outputFileName);
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]).catch((err) => console.error(`Error deleting local video files: ${err}`));
  return res.status(500).send(message);
};
