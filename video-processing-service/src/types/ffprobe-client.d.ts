declare module "ffprobe-client" {
  const ffprobe: (path: string) => Promise<any>;
  export default ffprobe;
}
