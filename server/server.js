const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:"./config/.env"});

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err);
  console.log(err.name, err.message);
  process.exit(1);
});
const app=require("./app");
// mongoose-connection.
mongoose.connect(process.env.MONGO_URL).then(con=>{
    console.log("MongoDB connected sucessfully")
});
const port=process.env.PORT||9000

app.listen(port,()=>{
    console.log(`Server s running on port  ${port}`)
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  console.error(err);
  process.exit(1);
});