import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
    try {
        const DB_URI = `${process.env.MONGO_URI.replace('{DB_USER_NAME}',process.env.MONGODB_USER_NAME).replace('{DB_USER_PASS}',process.env.MONGODB_USER_PASS)}/${DB_NAME}`
        const connectionInstance = await mongoose.connect(`${DB_URI}/${DB_NAME}`);
    } catch (error) {
        console.log('Mongo DB Connection Failed: ', error);
    }
}

export default connectDB