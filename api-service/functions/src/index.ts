import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();


// -- UPLOAD --
export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const {auth, data: {bucket, fileExtension}} = request;

  const rawBucket = storage.bucket(bucket);

  const fileName = `${auth.uid}-${Date.now()}.${fileExtension}`;

  // Generate signed URL for uploading file
  const [url] = await rawBucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // user uploads within 15 minutes
  });

  return {url, fileName};
});

export const checkProcessingStatus = onCall(
  {maxInstances: 1}, async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {fileName, collectionId} = request.data;

    const doc = await firestore
      .collection(collectionId).doc(fileName).get();

    if (!doc.exists) {
      return {status: "pending"};
      // If metadata hasn't been written yet
    }

    const docData = doc.data();
    const status = docData?.status;

    return {status};
  });

export const deleteVideo = onCall({maxInstances: 1}, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const {videoId, fileName, bucketName} = request.data;
  const doc = firestore.collection("videos").doc(videoId);

  if (!(await doc.get()).exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "The video metadata was not found"
    );
  }

  await doc.delete();

  const bucket = storage.bucket(bucketName);

  if (!bucket) {
    throw new functions.https.HttpsError(
      "not-found",
      "This bucket does not exist"
    );
  }

  const bucketFile = bucket.file(fileName);

  if (!bucketFile) {
    throw new functions.https.HttpsError(
      "not-found",
      "The file does not exist in the bucket"
    );
  }

  await bucketFile.delete();
});

// -- USER --
export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  return;
});

// -- VIDEOS --
const videoCollectionId = "videos";

export const getVideos = onCall({maxInstances: 1}, async () => {
  const querySnapshot = await firestore
    .collection(videoCollectionId)
    .get();
  return querySnapshot.docs.map((doc) => doc.data());
});

// -- IMAGES --
const imageCollectionId = "images";

export const getImages = onCall({maxInstances: 1}, async () => {
  const querySnapshot = await firestore
    .collection(imageCollectionId)
    .where("status", "==", "processed")
    .get();
  return querySnapshot.docs.map((doc) => doc.data());
});
