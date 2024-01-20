const User=require("../model/UserModel");
const factory=require("./factoryHandler");
exports.getAllUsers=factory.getAll(User);
exports.getOneUser=factory.getOne(User);
exports.updateUser=factory.updateOne(User);
exports.deleteUser=factory.deleteOne(User);