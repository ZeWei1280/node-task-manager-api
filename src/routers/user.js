import express from 'express';
import User from '../models/user.js'
import auth from '../middleware/auth.js'
import multer from 'multer';
import sharp from 'sharp';
import {sendLastEmail, sendWelcomeEmail} from '../emails/account.js'; 

const router = new express.Router();
const upload = multer({
    // dest: 'avatars', // 指定要傳入的資料夾位置，非資料庫
    // 若要傳入資料庫，要去user schema設置
    limits: {
        fileSize: 1000000 //上傳限制1MB
    },
    fileFilter(req, file, cb){ // cb: callback
        // if(!file.originalname.endsWith('.pdf')){
        //     return cb(new Error('File must be a PDF'));
        // }
        // if(!file.originalname.match(/\.(doc|docx)$/)){ //match裡面放的是reqular matching
        //     return cb(new Error('File must be a Word document'));
        // }  
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be jpg, jpeg, png'))
        }
        // cb(new Error('File must be a PDF'))
        cb(undefined, true)
        // cb(undefined, false)
    }
});

/*-------------------users---------------------*/
// post users
router.post('/users', async (req, res)=>{
    const user = new User(req.body);
    
    try{
        await user.save(); //可不寫,generateAuthToken會save
        sendWelcomeEmail(user.email, user.name); //這裡可以不用await，因為我們不需要等待郵件寄出才做事
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }catch(error){
        res.status(400).send(error);
    }

})


router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token;
        })
        await req.user.save();

        res.send();
    }catch(error){
        res.status(500).send();
    }   

})

router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();

        res.send();
    }catch(error){
        res.status(500).send();
    }
})

router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password); //可以透過其他屬性找到users
        const token = await user.generateAuthToken();
        res.send({user, token});
        // res.send({'user': user.getPublicProfile(), token});
    }catch(error){
        res.status(400).send();
    }
})


// get all users
// new request -> middleware: auth -> run route handler
router.get('/users/me', auth, async (req, res)=>{ 
    res.send(req.user)
})

// get user by ID 無用
// router.get('/users/:id', async (req, res)=>{
//     const userID = req.params.id;

//     try{
//         const result = await User.findById(userID);
//         if(!result) 
//             return res.status(404).send(); //資料庫中找不到時不會算錯，所以要處理找不到的情況
//         res.send(result);
//     }catch(error){
//         res.status(500).send();
//     }
// })

// update user
router.patch('/users/me', auth, async (req, res)=>{ //patch 只能修改當前有的屬性，不具有的屬性會直接忽略，但執行正確
    
    //可以定義當前有的屬性，讓其他的屬性會報錯
    const updates = Object.keys(req.body); //把object中的屬性以array回傳，只有key沒value
    const allowUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every( update => allowUpdates.includes(update));
    
    if(!isValidOperation)
        return res.status(400).send({error: 'Invalid updates'})
    //--


    try{
        //此三行等價下面一行，但是因為要幫資料加密(model中的pre)，所以修改後需要call save觸發!!
        // const user = await User.findById(req.params.id);
        // updates.forEach(update => user[update] = req.body[update]);
        // await user.save();
           
        //  const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true});
        // {new : true} 表示回傳修改後的資料，而不是修改前的資料
        // {runValidators: true} 表示一樣要用validator重新確認一次資料
       
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        // if(!user){
        //         return res.status(404).send();
        // }
        res.send(req.user);
    }catch(error){
        res.status(400).send(error);
    }
})

// delete user
router.delete('/users/me', auth, async (req, res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id);
        // if(!user)
        //     return res.status(404).send();
        sendLastEmail(req.user.email, req.user.name);
        await req.user.deleteOne();
        res.send(req.user);
    }catch(error){
        res.status(500).send();
    }
})


/*-------------------------------------------------------------------*/
// profile

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{

    // req.user.avatar = req.file.buffer; 
    // req.file是multer提供的，是上傳的檔案物件，包含以下屬性:
    // fieldname：文件上传字段的名称。
    // originalname：上传的文件的原始名称。
    // encoding：上传文件的编码类型。
    // mimetype：上传文件的 MIME 类型。
    // size：上传文件的大小，单位为字节。
    // destination：上传文件的保存目录。
    // filename：上传文件的保存名称。
    // path：上传文件的保存路径。
    // buffer：上传文件的二进制数据，这个属性仅在保存文件到内存时才存在()。
    
    // 在默認配置下，multer 將上傳的文件保存在內存中，而不是寫入磁盤。因此，
    // 可以通過 req.file.buffer 訪問文件的二進制數據，
    // 然後使用這些數據進行進一步的處理，
    // 例如寫入磁盤或將其傳輸到其他服務。
    // --- 
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();// 修改圖片大小by sharp
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message}); 
    // upload中有設定拋錯時的訊息，如果沒設定要send()啥，會send整個html，在這我們設定要send的只有訊息
})

router.delete('/users/me/avatar', auth, async (req, res)=>{
    try{
        req.user.avatar=undefined; //可以利用undefind來刪除file，666
        await req.user.save();
        res.send();
    }catch(error){
        res.atatus(500).send();
    }
})

router.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error()
        }

        // app.set() 方法用于设置应用程序级别的变量或属性。
        // 在此，set設定response header，其中 Content-Type 是响应头的一种属性，用于指定响应内容的 MIME 类型。
        // 未設定時Express自動設Content-Type為'application/json'
        res.set('Content-Type', 'image/jpg'); 
        res.send(user.avatar);
    }catch(error){

    }
})
export default router;