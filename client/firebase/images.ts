import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { rawImageBucketName } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getImagesFunction = httpsCallable(functions, "getImages");

type Image = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
};

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

export async function getImages() {
  const res = await getImagesFunction();
  return res.data as Image[];
}
