import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from './storage';



setupDirectories();

const app = express();
app.use(express.json());


app.post("/process-video", async (req, res) => {
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString(`utf8`);
        data = JSON.parse(message);
        if (!data.fileName) {
            throw new Error("Invalid message payload request");
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send(`Bad Request: missing fileName`);
    }
    const inputFileName = data.fileName;
    const outputFileName = `processed-${inputFileName}`;

    await downloadRawVideo(inputFileName);

    try {
        await convertVideo(inputFileName, outputFileName)
    } catch (error) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        console.error(error);
        return res.status(500).send(`Internal Server Error: failed to process video`);
    }
    await uploadProcessedVideo(outputFileName);
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);
    return res.status(200).send(`Processed video successfully`);


});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(
    `Video processing service listening at http://localhost:${port}`);
} );