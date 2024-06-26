const errorHandler=require("../utils/AppError");
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || "internal server error";


// wrong mongodb id.
    if(err.name==="CastError"){
        const message=`invalid ${err.path}:${err.value}`;
        err=new errorHandler(message,400);
    }
    // duplicate  key.
    if(err.code===11000){
        const message=`duplicate field value entered`;
        err=new errorHandler(message,400);
    }
    //duplicate key error
    if(err.name==="ValidationError"){
        const message=Object.values(err.errors).map((val)=>val.message);
        err=new errorHandler(message,400);
    }
    // wrong jwt token.
    if(err.name==="JsonWebTokenError"){
        const message=`invalid token please login again`;
        err=new errorHandler(message,400);
    }
    // token expired.
    if(err.name==="TokenExpiredError"){
        const message=`token expired please login again`;
        err=new errorHandler(message,400);
}
    
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
    }