import express from 'express';
import './db/mongoose.js';
import userRouter from './routers/user.js'
import taskRouter from './routers/task.js'

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


// 和index差異在於，這裡不用listen，並且當成module輸出，目的是為了做test
export default app;