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

setupDirectories();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/process-image", upload.single("image"), async (req, res) => {
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

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

  // Download the raw image from Cloud Storage
  await downloadRawImage(inputFileName);

  try {
    await convertImage(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      deleteRawImage(inputFileName),
      deleteProcessedImage(outputFileName),
    ]);
    return res.status(500).send("Image processing failed");
  }

  await uploadProcessedImage(outputFileName);

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
