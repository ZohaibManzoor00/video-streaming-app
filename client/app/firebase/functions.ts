import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const getImagesFunction = httpsCallable(functions, "getImages");

const rawVideoBucketName = "marcy-yt-raw-videos";
const rawImageBucketName = "marcy-yt-raw-images";

export async function uploadVideo(file: File) {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    bucket: rawVideoBucketName,
  });

  // Upload file to signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return uploadResult;
}

export async function uploadImage(file: File) {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    bucket: rawImageBucketName,
  });

  // Upload file to signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return uploadResult;
}

// -- VIDEOS --
export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
}

export async function getVideos() {
  const res = await getVideosFunction();
  return res.data as Video[];
}

// -- Images --
export interface Image {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
}

export async function getImages() {
  const res = await getImagesFunction();
  return res.data as Image[];
}
