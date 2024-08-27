import express from "express";
import multer from "multer";
import {
  convertImage,
  deleteProcessedImage,
  deleteRawImage,
  downloadRawImage,
  setupDirectories,
  uploadProcessedImage,
} from "./storage";
import { isImageNew, setImage } from "./firebase";

setupDirectories();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Endpoint invoked by pub/sub message
app.post("/process-image", upload.single("image"), async (req, res) => {
  // Get bucket and filename from pub/sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send("Bad Request: missing filename.");
  }

  const inputFileName = data.name; // <UID>-<DATE>.<EXTENSION>
  const outputFileName = `processed-${inputFileName}`;
  const imageId = inputFileName.split(".")[0];

  // Idempotency - safe for pub/sub to repeat requests w/o side effects
  if (!isImageNew(imageId)) {  
    return res
      .status(400)
      .send("Bad Request: Video already processing or processed.");
  } else {
    await setImage(imageId, { // add 'processing' status to firestore
      id: imageId,
      uid: imageId.split("-")[0],
      status: "processing",
    });
  }

  // Download raw image from Cloud Storage
  await downloadRawImage(inputFileName);

  // Process image
  try {
    await convertImage(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      setImage(imageId, {
        status: "failed",
        filename: outputFileName,
      }),
      deleteRawImage(inputFileName),
      deleteProcessedImage(outputFileName),
    ]);
    return res.status(500).send("Image processing failed");
  }

  // Upload processed image to Cloud Storage
  await uploadProcessedImage(outputFileName);

  // Change processing status of image in firestore
  await setImage(imageId, {
    status: "processed",
    filename: outputFileName,
  });

  await Promise.all([
    deleteRawImage(inputFileName),
    deleteProcessedImage(outputFileName),
  ]);

  return res.status(200).send("Image processing finished successfully");
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
