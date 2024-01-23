
const token = require("./token");
// Function to create and send tokens.
exports.createSendToken = (user, statusCode, res) => {
  // Generate access token
  const accessToken = token.generateAccessToken(user._id);
  console.log('JWT_COOKIE_EXPIRES:', process.env.JWT_COOKIE_EXPIRES);
console.log('REFRESH_TOKEN_COOKIE_EXPIRES:', process.env.REFRESH_TOKEN_COOKIE_EXPIRES);

  // Set access token cookie
  const accessTokenCookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "strict",
  };

  if (process.env.NODE_ENV === "production") {
    accessTokenCookieOptions.secure = true;
  }

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);

  // Generate refresh token
  const refreshToken = token.generateRefreshToken(user._id);

  // Set refresh token cookie
  const refreshTokenCookieOptions = {
    expires: new Date(
      Date.now() + process.env.REFRESH_TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "strict",
  };

  if (process.env.NODE_ENV === "production") {
    refreshTokenCookieOptions.secure = true;
  }

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  // Remove sensitive information from the user object
  user.password = undefined;

  // Send the response with the access token and user data
  res.status(statusCode).json({ status: "success", token: accessToken, data: { user } });
};