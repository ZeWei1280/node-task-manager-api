import mongoose from 'mongoose';

const connectionURL = process.env.MONGODB_URL 

const mongooseConnect = async ()=>{
    await mongoose.connect(connectionURL);
}
  
mongooseConnect();


