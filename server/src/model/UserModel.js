const mognoose=require("mongoose");
const validator=require("validator")
const bcrypt=require("bcryptjs");
const  crpyto=require("crypto");


const{Schema,model}=mognoose;
const userSchema=new Schema({
    firstName:{
        type:String, 
     required:[true," firstName required"],
     trim:true,
    },
    lastName:{
        type:String,
        required:[true,"lastName required"],
        trim:true

    },
    photo:{
type:String,
defult:"img.jpg"
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"invalid email address"]
    },
    phone:{
type:Number,
unique:[true,"Already used Phone Number"],
trim:true,
    },
    password:{
        type:String,
        required:[function(){
            return  this.New  || this.isModified("password")},"password  required"],
            minLength:[8,"passord  too short"],
            select:false},
 passwordConfirm:{
                type:String,
                required:[function(){
                    return this.isModified("password")
                },"password should be confirmed"],
                validate:{
                    validator:function(el){
                        return  !this.isNew ||el === this.password
                    },
                    message:"password  do not match"
                }
            },
            role:{
                type:String,
                default:"user",
                enum:["user","admin"]
            },
passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    deafult: true,
    select: false,
  },
 

},{timestamps:true});
// password encryption.
userSchema.pre("save",async function(next){
    if(this.isModified("password")) return next();
    try{ 
        this.password=await bcrypt.hash(this.password,12);
        this.passwordConfirm=undefined;
    } catch(err){
        return next(err)

    }

})

// password comparision instances.
userSchema.method.comparePassword=async function(candidtePassword,userPassword){
    return await  bcrypt.compare(candidtePassword,userPassword)
}
// password reset generator.
userSchema.method.createPasswordResetGenerator=async function(next){
const resetToken= crpyto.randomBytes(32).toString("hex");
const passwordResetToken=crpyto.createHash("sha256").update(resetToken).digest("hex");
this.passwordResetExpires=Date.now()+30*60*1000;
return resetToken

};
const User=model("User",userSchema);
module.exports=User
