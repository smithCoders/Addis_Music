const Song = require("../model/songModel");
const factory = require("./factoryHandler");
const multer = require("multer");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/AsyncHandler");

// Multer configuration for audio files
const multerAudioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only audio files", 400), false);
  }
};

const multerAudioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/songs");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.originalname}`);
  },
});

const uploadAudio = multer({ storage: multerAudioStorage, fileFilter: multerAudioFilter });

// Middleware to handle audio file upload
exports.uploadSong = uploadAudio.single("audio");

exports.addSong = asyncHandler(async (req, res, next) => {
  try {
    // Use req.user to get the information of the logged-in user
    const user = req.user;

    // The path of the uploaded audio file
    const audioFilePath = req.file.path;

    // Include user information along with other data in the creation of the song
    const songData = {
      user: user.id, // Assuming user.id is the user ID
      title: "hakuna matata",
      artist: req.body.artist || "Unknown",
      genre: req.body.genre,
      duration: req.body.duration,
      releaseDate: req.body.releaseDate,
      audio: audioFilePath, // Include the path to the uploaded audio file
      fileName:req.file.filename
    };

    // Create the song in the database
    const doc = await Song.create(songData);

    res.status(201).json({
      status: "success",
      data: { doc },
    });
  } catch (err) {
    console.log("err:", err);
    next(err);
  }
});


exports.getAllSong = factory.getAll(Song);
exports.getOneSong = factory.getOne(Song);
exports.updateSongInfo = factory.updateOne(Song);
exports.deleteSong = factory.deleteOne(Song);
