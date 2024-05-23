// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
dotenv.config({path: './env'})
import connectDB from './db/connection.js'
import { app } from './app.js'

const PORT = process.env.PORT || 8000

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is connected and running on PORT ${PORT}. Open it on browser http://localhost:${PORT}`);
    })
})
.catch((err) => {
    console.log(`Connection Failed!!!`);
})