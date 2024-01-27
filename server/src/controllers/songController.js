const mm=require("music-metadata");
const ytdl = require('ytdl-core');
const fs=require("fs")

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
   
    cb(null, `${file.originalname}`);
  },
});

const uploadAudio = multer({ storage: multerAudioStorage, fileFilter: multerAudioFilter });

// Middleware to handle audio file upload
exports.uploadAudio = uploadAudio.single("audio");

// Middleware to handle audio file upload and extract metadata
exports.extractMetadata = async (req, res, next) => {
  try {
    const audioFilePath = req.file.path;

    // Extract metadata from the uploaded audio file
    const metadata = await mm.parseFile(audioFilePath, { duration: true });

    // Attach metadata and audio name to the request body for later use
    req.body.metadata = metadata.common;
    req.body.audioName = req.file.originalname; // Use the original name of the file

    next();
  } catch (err) {
    console.error('Error extracting metadata:', err.message);
    return next(new AppError('Error extracting metadata', 500));
  }
};

// Middleware to handle YouTube link, fetch metadata, download audio, and save
exports.handleYouTubeLink = asyncHandler(async (req, res, next) => {
  try {
    const youtubeUrl = req.body.youtubeUrl;

    // Fetch metadata and download audio from YouTube using ytdl-core.
    const info = await ytdl.getInfo(youtubeUrl);
    const audioBuffer = await ytdl(youtubeUrl, { filter: "audioonly", quality: "highestaudio" }).pipe(
      require("bl")()
    );

    // Attach metadata and audio buffer to the request body for later use
    req.body.metadata = {
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      duration: parseInt(info.videoDetails.lengthSeconds), // Duration in seconds
     
    };
    req.body.audioBuffer = audioBuffer;

    next();
  } catch (err) {
    console.error("Error handling YouTube link:", err);
    return next(new AppError("Error handling YouTube link", 500));
  }
});

exports.addSongFromYouTube = asyncHandler(async (req, res, next) => {
  try {
    // Combine metadata and audio buffer with other data to create the song
    const songData = {
      title: req.body.title || req.body.metadata.title || "Unknown Title",
      user: req.user.id,
      fileName: req.body.metadata.title || "Unknown Filename", 
      artist: req.body.artist || req.body.metadata.artist || "Unknown Artist",
      genre: req.body.genre || "Unknown",
      duration: req.body.duration || req.body.metadata.duration || 0,
      releaseDate: req.body.releaseDate || null,
     
    };
 // Save audio buffer to the local file system
    const fileName = `${songData.fileName}.mp3`; 
    const filePath = path.join("public/songs", fileName);
    fs.writeFileSync(filePath, req.body.audioBuffer);
    // Save audio buffer to the database
    const song = await Song.create(songData);
    song.audio.data = req.body.audioBuffer;
    song.audio.contentType = "audio/mpeg";
    await song.save();

    res.status(201).json({
      status: "success",
      data: { song },
    });
  } catch (err) {
    console.error("Error adding song from YouTube:", err);
    return next(new AppError("Error adding song from YouTube", 500));
  }
});

// Controller for adding a song
exports.addSong = asyncHandler(async (req, res, next) => {
  try {
    // Combine metadata with other data to create the song
    const songData = {
      title: req.body.title || req.body.metadata.title || 'Unknown Title',
      user: req.user.id, 
      fileName: req.body.audioName || 'Unknown Filename',
      artist: req.body.artist || req.body.metadata.artist || 'Unknown Artist',
      genre: req.body.genre || 'Unknown',
  duration: req.body.duration || req.body.metadata.duration || 0,
  releaseDate: req.body.releaseDate || null,
    
    };

    // Create the song in the database
    const doc = await Song.create(songData);

    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  } catch (err) {
    console.error('Error adding song:', err.message);
    return next(new AppError('Error adding song', 500));
  }
});

// search songs. (based on title, artist and genere.)
exports.searchSong=asyncHandler(async(req,res,next)=>{
  // extract search query.
  const{query}=req.query;
  if(!query){
    return next(new AppError("search query required",400))
  }
  const song=await Song.find({user:req.user.id,$or:[
    {title:{$regex:query, $options :"i"}},
    {artist:{$regex:query, $options :"i"}},
   
  ]})
  res.status(200).json({
    status:"sucess",
    data:{song}

  })

})

// filter songs.based on artist name.
exports.filterSongs=asyncHandler(async(req,res,next)=>{
  const{artist}=req.query;
  // define base filter object.
  const filter={user:req.user.id};
  // add artist to filter.
  if(artist){
    filter=filter.artist;

  }
const song=await Song.find(filter)
  res.status(200).json({
    status: 'success',
    data: { song },
  });
})

exports.getAllSong = factory.getAll(Song);
exports.getOneSong = factory.getOne(Song);
exports.updateSongInfo = factory.updateOne(Song);
exports.deleteSong = factory.deleteOne(Song);
