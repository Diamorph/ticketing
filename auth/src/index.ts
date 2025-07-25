import {app} from './app';
import mongoose from "mongoose";

const start = async () => {
    console.log("Starting up...");

    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error);
    }

    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
}

start();


