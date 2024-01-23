const User=require("../model/UserModel");
const AppError=require("../utils/AppError");
const asyncHandler=require("../utils/AsyncHandler");
const jwtToken=require("../utils/jwt");
const tokens=require("../utils/token")
const{promisify}=require("util")
const jwt = require('jsonwebtoken'); 
// generate OTP.
exports.generateOTP=()=>{
    return Math.floor(100_000+Math.random()*900_000).toString()
}

exports.signUp = asyncHandler(async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm, role } = req.body;

    // Check if a user with the provided email or phone number already exists
    const userExist = await User.findOne( {email});

    if (userExist) {
      return next(new AppError("User with this email  already exists.", 400));
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
  
      password,
      passwordConfirm,
      role
    });

    jwtToken.createSendToken(newUser, 201, res);
  } catch (err) {
    console.log("error:", err);
    next(new AppError("Something went wrong.", 500));
  }
});

exports.logIn = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get login credentials.
    const { emailOrPhone, password } = req.body;

    // 2. Validate input.
    if (!emailOrPhone || !password) {
      return next(new AppError("Email or phone number and password are required.", 400));
    }

    // 3. Find user by email or phone.
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] }).select("password");

    // 4. Check if user exists.
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // 5. Compare the password.
    const isPasswordValid = user.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError("Invalid credentials. Please provide correct information.", 401));
    }

    // 6. If everything is correct, create and send the token.
    jwtToken.createSendToken(user, 200, res);
  } catch (error) {
    // Handle other errors (e.g., database connection issues).
    console.log("error:",error)
    next(new AppError("An error occurred while processing the request.", 500));
  }
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

exports.logOut = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError("You are not logged in. Please login to get access.", 401));
  }

  // Clear access token cookie
  res.clearCookie("accessToken");

  res.status(200).json({
    status: "success",
    data: {
      message: "Logout successful.",
    },
  });
});
