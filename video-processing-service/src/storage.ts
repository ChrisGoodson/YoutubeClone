import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { rejects } from 'assert';

const storage = new Storage();

const rawVideoBucketName = "chrisGoodson-raw-videos"
const processedVideoBucketName = "chrisGoodson-processed-videos"

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";



export function setupDirectories() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);

}


export async function downloadRawVideo(fileName: string) {
   await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({ destination: `${localRawVideoPath}/${fileName}`});
   
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    );
};


export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });
    console.log(
        `${localProcessedVideoPath} uploaded to gs://${processedVideoBucketName}/${fileName}.`
    )
    await bucket.file(fileName).makePublic();
}

//export async function deleteRawVideo(fileName: string) {
    
   // await storage.bucket(localRawVideoPath)
   // .file(fileName)
  //  .delete();
   // console.log(`gs://${localRawVideoPath}/${fileName} deleted.`);
//}
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory at ${dirPath}`);
    }
}

function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Error deleting file ${filePath}`);
                    console.log(JSON.stringify(err));
                    reject(err);
                } else {
                    console.log(`Deleted file ${filePath}`);
                    resolve();
                }
            })
        }   else {
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
    });
}

    


export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") //360p
        .on("end", ()=> {  
    
            console.log("Processing finished successfully");
            resolve();
        })
        .on("error", (err)=> {  
            console.log(`An error occurred: ${+ err.message}`);
            reject(err);
        })
    
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    

    });

}

