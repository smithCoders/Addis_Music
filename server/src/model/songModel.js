const mongoose=require("mongoose");
const {Schema,model}=mongoose;
const  songSchema=new Schema({
title:{
type:String,
unique:true,
trim:true,
required:[true,"song title is required"]
},
artist:{
    type:String,
    default:"Unknown"
},
genre:String,
duration:{
    type:Date,
    required:[true,"song duration required"],

},
releaseDate:{
    type:String,
    required:[true,"release Date required"]
},
averageRating:{
type:Number,
min:[1,"invalid rating value"],
max:[5,"too much rating"]
},
ratings:{
   type:Number,
   default:0 
}
artistPhoto:String



},{
    timestamps:true
});
const Song=model("Song",songSchema);
module.exports=Song