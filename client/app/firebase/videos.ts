import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");

const rawVideoBucketName = "marcy-yt-raw-videos";

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

export async function uploadVideo(file: File) {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    bucket: rawVideoBucketName,
  });

  // Upload file to raw g-cloud bucket via signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResult.ok) throw new Error("Failed Upload");

  const fileName = response.data?.fileName?.split(".")[0] || "";

  return { fileName };
}

// export async function getVideoProcessingStatus(
//   fileName: any,
//   collectionId: string
// ) {
//   const res = await checkProcessingStatusFunction({ fileName, collectionId });
//   const video = res.data as Video;
//   return video?.status;
// }

export async function getVideos() {
  const res = await getVideosFunction();
  return res.data as Video[];
}
