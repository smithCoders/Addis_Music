const express=require("express");
const helmet=require("helmet");
const rateLimit=require("express-rate-limit");
const morgan=require("morgan");
const error=require("./src/middleware/errorMiddleware");
const userRouter=require("./src/router/userRoute");
const songRouter=require("./src/router/songRoute");
const AppError = require("./src/utils/AppError");
const rotateTokens=require("./src/middleware/rotateTokens");
const app=express();
// secure HTTP Header.
app.use(helmet())
// morgan logger.
if(process.env.NODE_ENV==="developement"){
    app.use(morgan("dev"))
}
// Rate-limit.
const limiter=rateLimit({max:100,
    windowMs:1000*60*60,
    message: "too many request, please try again after an hour",
} );
// limt api request from the same IP.
app.use("/api",limiter)
// boy-parser.(limit the reading data )
app.use(express.json({limit:"100kb"}))
// app.use(rotateTokens.rotateTokens)
// Routers.
app.use("/api/v1/user",userRouter);
app.use("/api/v1/songs",songRouter);
app.all("*",(req,res,next)=>{
    next(new AppError(`page not found ${req.originalUrl}`))

})
app.use(error)
module.exports=app;