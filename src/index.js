// import express from 'express';
// import './db/mongoose.js';
// import userRouter from './routers/user.js'
// import taskRouter from './routers/task.js'

// const app = express();
import app from "./app.js";
const port = process.env.PORT /* || 3000 設定於環境變數*/;

// //
// import multer from 'multer';
// const upload = multer({
//     dest: 'images' // client會upload到我們的image資料夾，會不包含副檔名的binay file所以無法顯示，只要+上副檔名即完成
// });

// app.post('/upload', upload.single('upload'), (req, res)=>{ //'upload'為定義好的key，in req body form-data
//     res.send();
// }, (error, req, res, next)=>{
//     res.status.send({erroe:error.message}) //原來的return error是html格式，會透漏太多不必要的訊息，因此只取message!
// })
// middleware 成功會執行第一個callback，失敗會執行第二個callback，兩個callback的寫法固定，是app.method提供的
// 不用middle ware也能使用此邏輯
// 發生錯誤時，會產生Error object => error，而我們所設定的訊息就會存在error.message中，只需取出使用即可
/*
若是直接res.send()，則:
預設的錯誤處理函式會將錯誤訊息回傳給用戶端，並使用 HTML 格式將錯誤訊息顯示在網頁上。
這是因為在 Express 中，錯誤處理函式的第一個參數是錯誤物件，
如果你沒有自訂錯誤處理函式，Express 會假設你要將錯誤訊息回傳給用戶端。

設定錯誤處理:
((err, req, res, next) => {
  res.status(500).send('發生錯誤：' + err.message);
});
*/



// app.use(express.json());
// app.use(userRouter);
// app.use(taskRouter);


app.listen(port, ()=>{
    console.log('Server is up on port '+ port);
})
