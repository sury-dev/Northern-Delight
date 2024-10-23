import dotenv from 'dotenv';
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import express from 'express';
import { app } from './app.js';

dotenv.config({path : './.env'})

connectDB()
.then(() => {
    const port = process.env.PORT || 9000;
    app.listen(port, () => {
        console.log(`Server is listening on http://localhost:${port}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed : error from index.js, error : ", err);
})