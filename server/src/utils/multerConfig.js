const multer=require("multer");
const sharp=require("sharp");
const AsyncHandler=require("./AsyncHandler");
const AppError=require("./AppError");
// img-upload
const multerImgStorage=multer.memoryStorage();
const multerImgFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith("image")){
    cb(null,true)
  }
  else{
    cb(new AppError("please upload only image",400),false)
  }
}
const upload=multer({storage:multerImgStorage, fileFilter:multerImgFilter});
exports.uploadImg=upload.single("photo");
exports.resizeUserImg=AsyncHandler(async(req,res,next)=>{
  if(!req.file) return next();
  req.file.filename=`user-${req.user?.id}-${Date.now()}.jpeg`;
 await sharp(req.file.buffer).
  resize(500,500).
  toFormat("jpeg").
  jpeg({quality:90}).
  toFile(`public/img/users/${req.file.filename}`);
  next();
})
// uploading audio.
const multerAudioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only audio files', 400), false);
  }
};
const multerAudioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/songs'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.originalname}-${uniqueSuffix}`);
  },
});
exports.uploadFile=multer({storage:multerAudioStorage, fileFilter:multerAudioFilter})