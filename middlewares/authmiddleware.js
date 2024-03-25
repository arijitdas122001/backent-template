import { User } from "../model/user.js";
import { ApiError } from "../utils/ApiError.js"
import Jwt  from "jsonwebtoken";
export const verifyJWT=(req,res,next)=>{
    try {
        // get the token
        // verify with the jwt secret
        // find the user
        // update the req.user
        const token=req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","");
        if(!token){
            throw ApiError("Token Needed for authorization",401);
        }
        const decodeToken=Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=User.findById(decodeToken._id).select("-password -refreshToken");
        if(!user){
            throw ApiError("You are not authorized",401);
        }
        req.user=user;
        next();
    } catch (error) {
        throw ApiError("Error in the verifyJWT",400);
    }
}