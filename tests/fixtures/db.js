import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../../src/models/user';

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'VRYic', 
    email: 'haha@example.com',
    password: '123424141!',
    tokens:[{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }] 
}

const setupDatabase = async ()=>{
    await User.deleteMany();
    await new User(userOne).save();
}
export {
    userOneId,
    userOne,
    setupDatabase
}