import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs';
cloudinary.config({
    api_key:process.env.CLOUDINARY_API_KEY,
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudniary=(filepath)=>{
   try{ if(!filepath)return null;
    const response=cloudinary.uploader.upload(filepath,{
        resource_type:"auto",
    });
    fs.unlinkSync(filepath);
    return response;
  }catch(error){
    fs.unlinkSync(filepath);
    return null;
  }

}
export {uploadonCloudniary};