import mongoose from 'mongoose';

const connectionURL = process.env.MONGODB_URL 
await mongoose.connect(connectionURL);



