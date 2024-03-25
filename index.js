import express from 'express'
import dotenv from 'dotenv'
const app=express();
dotenv.config();
app.use(express.json());
app.listen(process.env.PORT_NO || 8080,()=>{
    console.log(`Server is running at port ${process.env.PORT_NO}`);
});
// routes
import { auth } from './routes/allroutes.js';
app.use('/api/v1/auth',auth);
export {app};