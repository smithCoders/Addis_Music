const express=require("express");
const helmet=require("helmet");
const rateLimit=require("express-rate-limit");
const morgan=require("morgan");
const error=require("./src/middleware/errorMiddleware");
const userRouter=require("./src/router/userRoute");
const AppError = require("./src/utils/AppError");
const app=express();
// secure HTTP Header.
app.use(helmet())
// morgan logger.
if(process.env.NODE_ENV="developement"){
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
// Routers.
app.use("/api/v1/user",userRouter);
app.all("*",(req,res,next)=>{
    next(new AppError(`page not found ${req.originalUrl}`))

})
app.use(error)
module.exports=app;