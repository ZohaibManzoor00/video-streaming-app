import { getVideos } from "../firebase/functions";

export default async function Videos() {
  const videos = await getVideos();
  return <></>;
}
