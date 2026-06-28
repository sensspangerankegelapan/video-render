const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const fs = require("fs-extra");
const path = require("path");
const { v4: uuid } = require("uuid");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
const PORT = process.env.PORT || 3000;

const TEMP_DIR = path.join(__dirname, "temp");
const OUTPUT_DIR = path.join(__dirname, "output");

fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(OUTPUT_DIR);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, TEMP_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext);
  }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.json({
    status: true,
    author: "sensspangerankegelapan",
    service: "Backend Video Render",
    uptime: process.uptime()
  });
});
app.post("/render", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Video tidak ditemukan"
      });
    }

    const input = req.file.path;
    const output = path.join(
      OUTPUT_DIR,
      uuid() + ".mp4"
    );

    ffmpeg(input)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-preset veryfast",
        "-movflags +faststart"
      ])
      .on("end", () => {
        fs.remove(input);

        res.download(output, err => {
          fs.remove(output);

          if (err) {
            console.log(err);
          }
        });
      })
      .on("error", err => {
        fs.remove(input);

        console.log(err);

        return res.status(500).json({
          status: false,
          message: "Render gagal"
        });
      })
      .save(output);

  } catch (e) {
    console.log(e);

    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
