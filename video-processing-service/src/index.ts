import express from 'express';
import ffmpeg from 'fluent-ffmpeg';



const app = express();
app.use(express.json());


app.post("/process-video", (req, res) => {
    // Get path of the input video
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if  (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.")
    }




});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(
    `Video processing service listening at http://localhost:${port}`);
} );