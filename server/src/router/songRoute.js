const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const songController = require("../controllers/songController");

router.use(authController.authorizeMe);

// Route for uploading audio from device
router.route("/from-device").post(
  songController.uploadAudio,
  songController.extractMetadata,
  songController.addSong
);

// Route for handling YouTube links
router.route("/from-youtube").post(
  songController.handleYouTubeLink,
  songController.addSongFromYouTube
);

router.route("/").get(songController.getAllSong);

router.route("/:id").get(songController.getOneSong).patch(songController.updateSongInfo).delete(songController.deleteSong);

module.exports = router;
