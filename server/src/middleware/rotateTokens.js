
const jwt = require('jsonwebtoken');
const User = require('../model/UserModel'); 
const tokens=require("../utils/token")
const AppError=require("../utils/AppError")
exports.rotateTokens = async (req, res, next) => {
  try {
    // Check if the request contains a valid access token
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      // If there's no access token, proceed to the next middleware
      return next(new AppError("access token not found",401));
    }

    // Verify the access token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Check if the access token is close to expiration ( within 5 minutes)
    const expirationThreshold = 5 * 60; // 5 minutes
    const timeToExpiration = decoded.exp - Math.floor(Date.now() / 1000);

    if (timeToExpiration < expirationThreshold) {
      // Access token is close to expiration, rotate tokens
      const user = await User.findById(decoded.id);

      if (!user) {
        // User not found, proceed to the next middleware
        return next(new AppError("user not found",404));
      }

      // Generate a new access token
      const newAccessToken = tokens.generateAccessToken(user)

      // Set the new access token cookie
      res.cookie('accessToken', newAccessToken, yourAccessTokenCookieOptions);

      // Rotate the refresh token (generate a new one)
      const newRefreshToken = tokens.generateRefreshToken(user)

      // Set the new refresh token cookie
      res.cookie('refreshToken', newRefreshToken, yourRefreshTokenCookieOptions);
    }
  } catch (error) {
    // Handle token verification errors (e.g., token is invalid)
    console.error('Token verification error:', error.message);
  }

  // Proceed to the next middleware
  next();
};
