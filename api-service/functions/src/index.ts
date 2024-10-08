import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;

  const bucket = storage.bucket(data.bucket);

  // Generate unique filename for upload
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

  // Get v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // user uploads within 15 minutes
  });

  return {url, fileName};
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

export const checkVideoStatus = onCall(
  {maxInstances: 1}, async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {fileName} = request.data;

    const doc = await firestore
      .collection(videoCollectionId).doc(fileName).get();

    if (!doc.exists) {
      // If metadata hasn't been written yet
      return {status: "pending"};
    }

    const docData = doc.data();
    const status = docData?.status;
    const progress = docData?.progress;

    return {status, progress};
  });

// -- Images --
const imageCollectionId = "images";

export const getImages = onCall({maxInstances: 1}, async () => {
  const querySnapshot = await firestore
    .collection(imageCollectionId)
    .get();
  return querySnapshot.docs.map((doc) => doc.data());
});
