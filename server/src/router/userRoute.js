const express=require("express");
const authController=require("../controllers/authController");
const userController=require("../controllers/userController");
const router=express.Router();
// signup.
router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.logIn);
router.use(authController.authorizeMe);
router.route("/logout").post(authController.logOut)
router.route("/").get(userController.getAllUsers);
router.route("/:userId").
get(userController.getOneUser).
patch(userController.updateUser)
.delete(authController.restrictTo("admin"),userController.deleteUser)
module.exports=router;