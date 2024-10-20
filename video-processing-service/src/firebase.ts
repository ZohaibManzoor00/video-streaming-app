import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

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
  mpd_url?: string;
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
  // const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  // return !snapshot.exists;
  const video = await getVideo(videoId);
  return video?.status === undefined;
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
