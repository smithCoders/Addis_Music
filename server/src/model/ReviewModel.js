const mongoose=require("mongoose");
const {Schema,model}=mongoose;
const reviewSchema=new Schema({
review:{
    type:String,
    required:[true,"music must have review"]
},
rating:{
    type:Number,
    min:1,
    max:5
},
user:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:[true,"review must have author"]

},
song:{
    type:Schema.Types.ObjectId,
    ref:"Song",
    required:[true,"review must belongs to certain song"]
}
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
// prevent duplicate reviews.
reviewSchema.index({song:1, user:1}, {unique:true})
reviewSchema.pre(/^find/,async function(next){
    this.populate({
        path:"user"
         ,select:"name photo"})
    next()

});
// calculate averageRating.
reviewSchema.statics.calculateAvgRating= async function(songId){
   //1.point to current document.
   const stats=await this.aggregate([{
    $match:{song:songId}},
   { $group:{_id:"$song",
            numRating:{$sum:1},
            avgRating:{$avg:"$rating"}
}
   }])

};
// middleware to save the avgRating.
reviewSchema.post("save",function(){
    this.constructor.calculateAvgRating(this.song);
    
})
const Review=model("Review",reviewSchema);
module.export=Review