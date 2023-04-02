import jwt from 'jsonwebtoken';
import User from '../models/user.js'

const auth = async (req, res, next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token}); // 會找第一個符合的，再去找第二個符合的
        
        if(!user)
            throw new Error();

        req.token = token;// 設定為當前使用的token，就可以用來access，目的是某裝置登出時用來刪除該token
        req.user = user;
        next();
    }catch(error){
        res.status(401).send({error: 'Please authenticate'})
    }
    // next();
}

export default auth;

// Without middleware: new request -> run route handler
// With middleware: new request -> do something(結束要call next()) -> run route handler
/*
app.use((req, res, next)=>{
    console.log(req.method, req.path);
    next();
})
*/

/*
// 利用middleware來阻止操作
app.use((req, res, next)=>{
    if(req.method === 'GET'){
        res.send('GET request are disable');
    }
    else{
        next();
    }
})

app.use((req, res, next)=>{
    res.status(503).send('Site is currently down, Check back soon!');
})
*/