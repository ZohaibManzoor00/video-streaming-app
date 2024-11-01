import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore, Timestamp, FirebaseFirestoreError } from "firebase-admin/firestore";

initializeApp({ credential: credential.applicationDefault() });
export const firestore = new Firestore();
const videoCollectionId = "videos";

export type Video = { // ? Add processing start and end times
  id?: string;
  uid?: string;
  filename?: string;
  status?: VideoStatus;
  progress?: VideoProgress;
  transcodingProgress?: number;
  retryCount?: number; // ! change to processingAttempts
  errorMessage?: string;
  duration?: number;
  createdAt?: Timestamp;
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
  GeneratingThumbnail = "generating thumbnail",
  Uploading = "uploading",
  Complete = "complete",
}


/**
 * * Retrieves a video document from Firestore by its ID.
 *
 * @param {string} videoId - The ID of the video to retrieve.
 * @returns {Promise<Video>} A promise that resolves to the video data if found, or an empty object if not found.
 * @throws {FirebaseFirestoreError} Throws if retrieval fails due to network issues, permission errors, or invalid `videoId`.
 */
export const getVideo = async (videoId: string): Promise<Video> => {
  try {
    const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
    return (snapshot.data() as Video) ?? {};
  } catch (error) {
    if (error instanceof FirebaseFirestoreError) {
      console.error(`Firestore error while retrieving video ${videoId}:`, error);
      throw new Error(`Unable to retrieve video: ${error.message}`);
    }
    console.error(`Unexpected error when retrieving video with ID: [${videoId}]`, error);
    throw error;
  }
};


/**
 * * Upserts a video document in Firestore.
 *
 * @param {string} videoId - The ID of the video to set or update.
 * @param {Video} videoData - The data to set for the video.
 * @param {FirebaseFirestore.Transaction} [transaction] - Optional Firestore transaction for atomic updates.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {FirebaseFirestoreError} Will throw a FirestoreError if the operation fails due to network issues, permission errors, invalid data, or transaction failures.
 */
export const setVideo = async (videoId: string, videoData: Video, transaction?: FirebaseFirestore.Transaction): Promise<void> => {
  const videoRef = firestore.collection(videoCollectionId).doc(videoId);

  try {
    if (transaction) transaction.set(videoRef, videoData, { merge: true });
    else await videoRef.set(videoData, { merge: true });
  } catch (error) {
    if (error instanceof FirebaseFirestoreError) {
      console.error(`Firestore error while setting video ${videoId}:`, error);
      throw new Error(`Unable to set video: ${error.message}`);
    }
    console.error(`Unexpected error when setting video with ID: [${videoId}]`, error);
    throw error;
  }
};
