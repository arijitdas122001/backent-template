import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import Jwt  from "jsonwebtoken";
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
UserSchema.pre("save",async function(next){
    if(this.isModified("password")){
    this.password=await bcrypt.hash(this.password,10);
    }
    next();
})
UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessToken=function(){
    return Jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateSessionToken=function(){
    return Jwt.sign(
        {
            _id:this._id,
        },
        process.env.SESSION_TOKEN_SECRET,
        {
            expiresIn:process.env.SESSION_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", UserSchema);