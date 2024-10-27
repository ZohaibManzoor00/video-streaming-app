import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

initializeApp({ credential: credential.applicationDefault() });
export const firestore = new Firestore();
const videoCollectionId = "videos";

export type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: VideoStatus;
  progress?: VideoProgress;
  transcodingProgress?: number;
  retryCount?: number;
  errorMessage?: string;
};

export enum VideoStatus {
  Processing = "processing",
  Processed = "processed",
  Failed = "failed",
  PermanentlyFailed = "permanently failed",
}

export enum VideoProgress {
  Initializing = "initializing",
  Downloading = "downloading",
  Transcoding = "transcoding",
  Uploading = "uploading",
  Complete = "complete",
}

export const getVideo = async (videoId: string): Promise<Video> => {
  const snapshot = await firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .get();
  return (snapshot.data() as Video) ?? {};
};

export const setVideo = async (
  videoId: string,
  videoData: Video,
  transaction?: FirebaseFirestore.Transaction
): Promise<void> => {
  const videoRef = firestore.collection(videoCollectionId).doc(videoId);

  if (transaction) transaction.set(videoRef, videoData, { merge: true });
  else await videoRef.set(videoData, { merge: true });
};

export const isVideoNew = async (videoId: string): Promise<boolean> => {
  // const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  // return !snapshot.exists;
  const video = await getVideo(videoId);
  return video?.status === undefined;
};

export const updateVideo = async (
  videoId: string,
  status: VideoStatus,
  progress: VideoProgress,
  filename: null | string = null
) => {
  const updateData: Partial<Video> = { status, progress };
  if (filename) updateData.filename = filename;
  await setVideo(videoId, updateData);
};
