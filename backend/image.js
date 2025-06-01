import express from "express";
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import Jimp from "jimp";

const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);
__dirname = path.resolve(__dirname, '..');

const app = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, callbaclk) {
        callbaclk(null, __dirname + "/images")
    },
    filename: function (req, file, callbaclk) {
        callbaclk(null, file.originalname);
    },
})
const uploads = multer({ storage: storage });

app.post("/image", uploads.array("files"), async (req, res) => {
    const files = req.files;
    try {
        for (const file of files) {
            const image = await Jimp.read(file.path);
            await image.scaleToFit(500, 500).writeAsync(file.path);
        }
        return res.json("success");
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "Failed to process image" });
    }
});

app.get("/imageGet/:imgname", (req, res) => {
    const imgName = req.params.imgname
    res.sendFile(__dirname + '/images/' + imgName + '.png')
})

export default function imageRouter() {

    return app;
}
