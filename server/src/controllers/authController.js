const User=require("../model/UserModel");
const AppError=require("../utils/AppError");
const asyncHandler=require("../utils/AsyncHandler");
const jwtToken=require("../utils/jwt");
const tokens=require("../utils/token")
const{promisify}=require("util")
// generate OTP.
exports.generateOTP=()=>{
    return Math.floor(100_000+Math.random()*900_000).toString()
}

exports.signUp=asyncHandler(async(req,res,next)=>{
    const{firstName,lastName,email,password,passwordConfirm,role}=req.body;
    // check if user if already signup.
    const userExist=await User.findOne({email});
    if(!userExist){
        return next(new AppError("user already exist.",404))
    }
const newUser=await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        role
    });
 jwtToken.createSendToken(newUser,201,res)

});

exports.logIn=asyncHandler(async(req,res,next)=>{
    // 1. get login credentials.
    const {emailOrPhone,password}=req.body;
    if(!emailOrPhone ){
        return next(new AppError("email or phone umber is required",400))
    }
    if(!password){
        return next(new AppError("password is required",400))
    }
    // 2. check if user exist and password is correct.
    const user=await User.findOne({$or:[{email:emailOrPhone},{phone:emailOrPhone}]}).select("password");
    if(!user){
        return next(new AppError("user not found",404))
    };
    // compare the password.
    if(!user || !(user.comparePassword(password,user.password))){
        return next(new AppError("Invalid credentials, come agina with correct  information",401))
    }
    jwtToken.createSendToken(200,user,res)
});
// user authorize.
exports.authorizeMe=asyncHandler(async(req,res,next)=>{

try {
    // 1. Check if the authorization header is present
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return next(
        new AppError("you are not logged in please login to get access", 401)
      );
    }

    // 3. Verify the token using the correct secret
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

   

    // 4. Check if the user exists
    const currentUser = await User.findById(decoded.user);
    if (!currentUser) {
      return next(new AppError('Unauthorized - Invalid user', 401));
    }

    // 5. Attach the user information to the request
    req.user = currentUser;
    next();
  } catch (err) {
    console.log("Error:", err);
    return next(new AppError('Unauthorized - Invalid token', 401));
  }
});
// restrict route.
exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
          if(!roles.includes(req.user.role)){
            return next(new AppError("you do not have permission to perform this action",403))
        }
        next()
    }
}
exports.getRefreshToken=asyncHandler(async(req,res,next)=>{
  const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
    return next(new AppError("please provide a refresh token",400))
  }
  // verify refresh token.
  const decoded=tokens.verifyRefreshToken(refreshToken)

  // check if user exist.
  const currentUser=await User.findById(decoded.user)

  if(!currentUser ){
    return next(new AppError("the user belonging to this token does not exist",401))
}
// check if refresh token is valid.

if (currentUser.refreshToken !== refreshToken) {
  return next(new AppError("Invalid refresh token", 401));
}

// generate new acess token.
const accessToken=tokens.generateAccessToken(currentUser)
// send new access token as cookie.
res.cookie("acessToken",accessToken,{
  httpOnly:true,
  maxAge:30*60*1000,
  secure:process.env.NODE_ENV="production"
})
res.status(200).json({
  status:"sucess",
  accessToken
})
}
);

exports.logOut=asyncHandler(async(req,res,next)=>{
  const  user=req.user;
  if(!user){
    return next(new AppError("you are not logged in please login to get access",401))

  }
  // clear access token.
  res.clear("accessToken");
res.status(200).json({
  status:"sucess",
  message:"logout sucessfuly."

})


})