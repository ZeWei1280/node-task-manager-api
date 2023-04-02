import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Task from './task.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, 
    },
    email: {
        type: String,
        required:true,
        unique:true,
        trim: true, 
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    age: {
        type: Number,
        default: 0, 
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7, 
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Invalid password!');
            }
        }
    },
    tokens: [{      //定義tokens的資料格式為一個array，能存多個token (for多個登入ex:手機、電腦)
        token:{     //定義每個token的屬性(為sub ducument)
            type:String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, { // 第二個參數設定options ex:timestamp
    timestamps: true 
})


// 該比數據不會實際存進資料庫中，但是功能差不多，即可從user之下建立一個虛擬的tasks欄位
// 主要目的是要讓mongoose知道資料的連結性，'tasks'可任意命名
// 目的: 建立資料的連結性
userSchema.virtual('tasks', { 
    ref:'Task',         // 可以參考其他model
    localField: '_id', //在該document中(user)的名稱為'_id'
    foreignField: 'owner'    //在連結document中(ref，即Task)的名稱為'owner'
})

/*-----------------------------------------------------------*/
// userSchema.methods.getPublicProfile = function (){
//     const user = this;
//     const userObject = user.toObject(); //toObject 是由 mongoose提供的，把json轉成object
    
//     delete userObject.password;
//     delete userObject.tokens;

//     return userObject;
// }
//可直接由下面這段取代，命名要為toJSON()!
userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject(); //toObject 是由 mongoose提供的，把json轉成object
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}
/*-----------------------------------------------------------*/



// instences methods，針對個別instence作操作用的，用methods
// 因為要綁定this，所以用一般function不用arrow function
userSchema.methods.generateAuthToken = async function (){
    const user = this;

    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    // const token = jwt.sign({ _id: user._id.toString() }, SECRET, { expiresIn: '1 day' })
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET); 
    
    // 將該 token 存入資料庫中：讓使用者能跨裝置登入及登出
    //concat和push類似，差異只在於，如果要串的是array，push會放整個array，concate放array的內容
    user.tokens = user.tokens.concat({ token }); 
    await user.save();
    return token;
}



// model methods，針對model作操作用的，用statics
// 在user schema中新增static function供router使用，用來設計登入系統，透過email、password找user
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email}) //找到第一個符合條件的
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error('unablle to login');
    }

    return user;
}

// Hash the plain text password before saving
userSchema.pre('save', async function(next){ //function不能用arrow，因為this在此要綁定
    const user = this;

    // 當user的 'password'被修改時才會觸發並往下執行
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); //mongoose 5.0以上不用手動設置
})


// Delete user when user is removed
// {document:true, query:false}，因為deleteOne()、updeteOne()等操作，預設的pre hook是在query(即model)上的，
// 要改成在document上才能執行
// 兩者的'this'綁定不一樣，一個是綁在query上(modedl)，一個是綁在document上，如果綁在query上就不能刪除，
// 因此在刪除document時，this將是一個包含查詢條件的query object，而不是要刪除的document對象。

// 此題的例子若不寫{document:true}，則this = {user id:xxxx}這個查詢條件，而不是document本身
userSchema.pre('deleteOne', {document:true}, async function(next) {
    const user = this;
    // console.log(this);
    await Task.deleteMany({owner: user._id});
    next();
})
const User = mongoose.model('User', userSchema);

export default User;