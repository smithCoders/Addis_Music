const AppError=require("../utils/AppError");
const asyncHandler=require("../utils/AsyncHandler");

exports.createOne=Model=>asyncHandler(async (req,res,next)=>{
const doc=await Model.create(req.body);
res.status(201).json({
    status:"sucess",

    data:{doc}

})
 });
 exports.getOne=Model=>asyncHandler(async(req,res,next)=>{
    const  doc=await Model.findOne(req.params.id);
    if(!doc){
        return next(new AppError("Document not found",404))
    }
  res.status(200).json({
  status: "success",
  message: "Operation successful",
  data: { doc }
});


 });
 exports.getAll=Model=>asyncHandler(async(req,res,next)=>{
    const docs=await Model.find();
    if(!docs){
        return next(new AppError("documents not found",404))
    };
    res.status(200).json({
        status:"sucess",
         message: "Operation successful",
        result:docs.length,
        data:{docs}
    })
 });
exports.updateOne=Model=>asyncHandler(async(req,res,next)=>{
    const doc=await Model.findByIdAndUpdate(req.params?.id,
        req.body,
        {new:true,runValidators:true});
    if(!doc){
return next(new AppError("document not found",404))
    }
    res.status(200).json({
        status:"sucess",
         message: "Operation successful",
        data:{doc}
    })
});
exports.deleteOne=Model=>asyncHandler(async(req,res,next)=>{
    const doc=await Model.findBYIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError("document not found",404))
    };
    res.status(204).json({status:"sucess",message:"document deleted sucesffully"})
})