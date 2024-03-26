import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.js";
import { uploadonCloudniary } from "../utils/couldinary.js";
import { Jwt } from "jsonwebtoken";

const genrateAccessTokenAndRefreshToken=async (userId)=>{
  try {
  const user=User.findById(userId);
  const accessToken=await user.generateAccessToken();
  const refreshToken=await user.generateSessionToken();
  user.refreshToken=refreshToken;
  await user.save({validateBeforeSave:false});
  return {accessToken,refreshToken};
} catch (error) {
  throw new apiError("Something Happend while generating refreshToken",500);
}
}
export const register = async(req, res) => {
  const { username, email, fullname, password } = req.body;
  if (
    // if any of the fieled is not present
    [username, email, fullname, password].some((filed) => filed?.trim() === "")
  ) {
    throw new apiError("Fields can not be empty!!", 400);
  }
  const currUser = User.findOne({
    $or: [{ username }, { email }],
  });
  // If the current user exists
  if (currUser) {
    throw new apiError("User Already Exists", 409);
  } else {
    // extracting the file paths
    const avatarfilepath=req.files?.avtar[0]?.path;
    const coverImagepath=req.files?.CoverImage[0]?.path;

    if(!avatarfilepath){
      throw new apiError("FilePath not exists",400);
    }
    // uploading on cloudnary
    const uploadAvtar=await uploadonCloudniary(avatarfilepath);
    const uploadCover=  await uploadonCloudniary(coverImagepath);

    const user=await User.create({
      username:username,
      email,
      fullname,
      avtar:uploadAvtar.url,
      CoverImage:uploadCover.url || "",
      password
    });
    const createdUser=await User.findOne(user._id).select(
      "-password -refreshToken"
    );
    if(!createdUser){
      throw new apiError("Problem creating user",500);
    }
    res.status(201).send({"user registered succesfully":createdUser});
  }
};
export const LogIn=async(req,res)=>{
  // get username,email,password
  //check if any of the field is not empty
  // check if the user exist or not
  // then check the password
  // access token and refesh token sent to the user
  const {username,email,password}=req.body;
  if(!username || !email){
    throw new apiError("Required fields are mandatory",400);
  }
  const user=await User.findOne({
    $or:[{username},{email}]
  });
  if(!user){
    throw new apiError("User Not Registered",404);
  }
  const isCorrect=await user.isPasswordCorrect(password);
  if(!isCorrect){
    throw new apiError("Password is not correct",401);
  }
  const {accessToken,refreshToken}=await genrateAccessTokenAndRefreshToken(user._id);
  const currUser=user.findById(user._id).select("-password -refreshToken");
  const option={
    httpOnly:true,
    secure:true
  }
  res.status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .send({"logged In":currUser});
};
export const LogOut=async(req,res)=>{
// verify if it is the same user or not(create middlewire)
// have to fetch the data of the user
//set refreshtoken data to undefined
const user=req.user;
await User.findByIdAndDelete(user._id,
  {
    $set:{
      refreshToken:undefined,
    }
  }
)
const option={
  httpOnly:true,
  secure:true
}
return res.status(200)
.clearcookie('accessToken',option)
.clearcookie('refreshToken',option)
.send("User Logged Out Successfully");
}
export const RefreshAccessToken=async()=>{
// authinticate user
// fetch the refresh token from user database
//generate new token
// save the new token into cookies and databasaes
const recentRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
if(!recentRefreshToken){
  throw new ApiError("Not authenticated",401);
}
try {
  const verification=Jwt.verify(recentRefreshToken,process.env.SESSION_TOKEN_SECRET);
  const user=User.findById(verification?._id);
  if(!user){
    throw new apiError("You are not authenticated to continue the session",401);
  }
  const {accessToken,refreshToken}=genrateAccessTokenAndRefreshToken(user._id);
  const option={
    httpOnly:true,
    secure:true
  }
  res.status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .send({"RefreshedAccessToken":user});
} catch (error) {
  throw new ApiError(error?.message || "Invalid RefreshTokne",401);
}
};
const changeCurrentPassword=async(req,res)=>{
  try {
    const {currentPassword,newPassword}=req.body;
    if(!currentPassword || !newPassword){
      throw ApiError("Please give the mandatory input fileds",401);
    }
    const user=await User.findById(req.user?._id);
    if(!user){
      throw ApiError("You are not authinticated",401);
    }
    const isPasswordCorrect=await user.isPasswordCorrect(currentPassword);
    if(!isPasswordCorrect){
      throw ApiError("Please Enter the valid password",401);
    }
      user.password=newPassword;
      await user.save({validateBeforeSave:false});
      res.status(200)
      .json({"success":"password changed"});
  } catch (error) {
    throw ApiError("error while chaging the password",400);
  }
}
const updateAvtar=async(req,res)=>{
  const avtar=req.file?.path;
  const file=await uploadonCloudniary(avtar);
  if(!file.url){
    throw ApiError("Error while uploading on cloudniary",400);
  }
  const user=await User.findByIdAndUpdate(req.user._id,{
    $set:{
      avatar:file.url,
    }
  },
  {new:true}).select("-password");
  res.status(200)
  .send({"success":"avtar updated"});
};  