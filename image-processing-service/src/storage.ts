import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import fs from "fs";

const storage = new Storage();

const rawImageBucketName = "marcy-yt-raw-images";
const processedImageBucketName = "marcy-yt-processed-images";

const localRawImagePath = "./raw-images";
const localProcessedImagePath = "./processed-images";

/**
 * Creates the local directories for raw and processed images
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawImagePath);
  ensureDirectoryExistence(localProcessedImagePath);
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawImageBucketName} bucket into the {@link localRawImagePath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawImage(fileName: string) {
  await storage
    .bucket(rawImageBucketName)
    .file(fileName)
    .download({
      destination: `${localRawImagePath}/${fileName}`,
    });

  console.log(
    `gs://${rawImageBucketName}/${fileName} downloaded to ${localRawImagePath}/${fileName}.`
  );
}

/**
 * @param rawImageName - The name of the file to convert from {@link localRawImagePath}.
 * @param processedImageName - The name of the file to convert to {@link localProcessedImagePath}.
 * @returns A promise that resolves when the image has been converted.
 */
export function convertImage(rawImageName: string, processedImageName: string) {
  return new Promise<void>(async (resolve, reject) => {
    sharp(`${localRawImagePath}/${rawImageName}`)
      .resize({ width: 800, withoutEnlargement: true }) // Resize the image to 800px width
      .toFormat("jpeg") // png to increase lossy if needed
      .jpeg({ quality: 100 }) // Maintain 100% quality
      .toFile(`${localProcessedImagePath}/${processedImageName}`) // Save the processed image locally
      .then(async () => {
        console.log("Image processing finished successfully");
        await deleteRawImageFromBucket(rawImageName);
        resolve();
      })
      .catch(async (err: any) => {
        console.error("Image processing error occurred: " + err.message);
        await deleteRawImageFromBucket(rawImageName);
        reject(err);
      });
  });
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedImagePath} folder into the {@link processedImageBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedImage(fileName: string) {
  const bucket = storage.bucket(processedImageBucketName);

  await storage
    .bucket(processedImageBucketName)
    .upload(`${localProcessedImagePath}/${fileName}`, {
      destination: fileName,
    });
  console.log(
    `${localProcessedImagePath}/${fileName} uploaded to gs://${processedImageBucketName}/${fileName}.`
  );

  // Set image to be publicly readable
  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link rawImageBucketName} bucket.
 * @returns A promise that resolves when the file has been deleted.
 */
export async function deleteRawImageFromBucket(fileName: string) {
  await storage.bucket(rawImageBucketName).file(fileName).delete();

  console.log(`Successfully deleted gs://${rawImageBucketName}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawImagePath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */
export function deleteRawImage(fileName: string) {
  return deleteFile(`${localRawImagePath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedImagePath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */
export function deleteProcessedImage(fileName: string) {
  return deleteFile(`${localProcessedImagePath}/${fileName}`);
}

/**
 * @param filePath - The local path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve();
    }
  });
}
