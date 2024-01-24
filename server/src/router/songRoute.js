const express=require("express");
const router=express.Router();
const authController=require("../controllers/authController");
const songController=require("../controllers/songController");
router.use(authController.authorizeMe);
router.route("/").post(songController.uploadSong,songController.addSong)
.get(songController.getAllSong);

router.route("/:id")
.get(songController.getOneSong)
.patch(songController.updateSongInfo)
.delete(songController.deleteSong)

module.exports=router;