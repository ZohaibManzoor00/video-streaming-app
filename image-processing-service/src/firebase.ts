import {credential} from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

const imageCollectionId = 'images';

export interface Image {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed' | 'failed',
}

async function getImage(imageId: string) {
  const snapshot = await firestore.collection(imageCollectionId).doc(imageId).get();
  return (snapshot.data() as Image) ?? {};
}

export function setImage(imageId: string, image: Image) {
  return firestore
    .collection(imageCollectionId)
    .doc(imageId)
    .set(image, { merge: true })
}

export async function isImageNew(imageId: string) {
  const image = await getImage(imageId);
  return image?.status === undefined;
}

export async function isFailedImageUpload(imageId: string) {
  const image = await getImage(imageId);
  return image?.status === 'failed';
}
