const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
  return accessToken;
};

exports.generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  return refreshToken;
};

exports.verifyAccessToken = (token) => {
  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return user;
  } catch (error) {
    console.error("Error verifying access token:", error);
    return null;
  }
};

exports.verifyRefreshToken = (token) => {
  try {
    const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return user;
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
};