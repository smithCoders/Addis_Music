const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const songSchema = new Schema({
  title: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Song title is required"],
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:"User",
    // required:[true,"who add this song?"]
  },
  fileName:String,
  artist: {
    type: String,
    default: "Unknown",
  },
genre: {
    type: String,
    // enum: ["Pop", "Rock", "Hip Hop", "Electronic", "Classical", "Jazz", "Other"],
    // required: true,
  },
  duration: {
    type: Date,
    default:0
    // required: [true, "Song duration is required"],
  },
  releaseDate: {
    type: Date, 
    default:Date.now()
    // required: [true, "Release date is required"],
  },
  averageRating: {
    type: Number,
    min: [1, "Invalid rating value"],
    max: [5, "Too much rating"],
    validate: {
      validator: Number.isInteger,
      message: "Average rating must be an integer.",
    },
  },
  ratings: {
    type: Number,
    default: 0,
  },
   audio: {
    data: Buffer,
    contentType: String,
  },
  artistPhoto: String,
}, 


{
  timestamps: true,
});

const Song = model("Song", songSchema);

module.exports = Song;
