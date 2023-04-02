import express from 'express';
import Task from '../models/task.js';
import auth from '../middleware/auth.js';
const router = new express.Router();

/*-------------------tasks---------------------*/
// creat tasks
router.post('/tasks', auth, async (req, res)=>{
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body, //spread operator，只要能展開的就能去展開EX array、Obj
        owner: req.user._id //有middleware auth會給request賦予token和user，此行才能執行
    })

    try{
        await task.save();
        res.status(201).send(task);
    }catch(error){
        res.status(400).send(error);
    }

})

// get all tasks
// 要取得的資料由全部->尚未完成之tasks
// GET /tasks?completed=true
// 取得資料前幾筆
// GET /tasks?limit=10&skip=20
//
// GET /tasks?sortBy=createsAt_asc，也可用分號取代_，隨意自訂
router.get('/tasks', auth, async (req, res)=>{
    try{
        /* 方法1 */
        // const result = await Task.find({owner: req.user._id});
        // res.send(result);
        /* 方法2 */
        // await req.user.populate('tasks'); 
        // await req.user.populate({path: 'tasks'}); 同上，預設為path
        // res.send(req.user.tasks);

        const match = {}; // 用於指定額外的查詢條件，以限制填充的文檔。
        const sort = {}; // 用於排序續取得的資料 

        if(req.query.completed){
            match['completed'] = req.query.completed === 'true'; // 預設是string要轉成boolean
            // match.completed也行
            // URL上問號後面的東西會丟進express.query裡，ex: {{url}}/tasks?completed=false 則 query: 'completed=false'
            // HackMD筆記: https://hackmd.io/AOKEz1-0TrW0jhLaFqZzoQ?both#3-HTTP-Query
        }


        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1]==='desc'? -1:1;
            
        }

        await req.user.populate({ 
            path:'tasks', // 即user mongoose virtual 的
            match,         //用此方式就能讀取url來上的參數來動態過濾return的資料了，非常重要!!
            options: { 
                limit: parseInt(req.query.limit), //顯示前n筆資料
                skip: parseInt(req.query.skip),   //要略過前幾筆資料
                sort
        // sort: {
        //     createdAt: -1 // by創建的時間，-1為遞減:最新排到最舊，反之1為遞增
        //     // completed: 1 // 1為遞增，所以把false先排
        // }
            }
        })
        res.send(req.user.tasks);
    }
    catch(error){
        res.status(500).send();
    }
})

// get a task by ID
router.get('/tasks/:id', auth, async (req, res)=>{
    const taskID = req.params.id;

    try{
        // const result = await Task.findById(taskID);
        const result = await Task.findOne({_id:taskID, owner: req.user._id});
        if(!result)  
            return res.status(404).send();
        res.status(200).send(result);
    }catch(error){
        res.status(500).send();
    }

})

// update task
router.patch('/tasks/:id', auth, async (req, res)=>{
    //patch允許不存在的property
    const updates = Object.keys(req.body);
    const allowUpdates = ['description', 'completed'];
    const isValidOperation = updates.every( update => allowUpdates.includes(update));
    if(!isValidOperation)
        return res.status(400).send({error: 'Invalid Operation!'});
    
    try{

        //同user
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true});
        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if(!task){
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    }catch(error){
        res.status(400).send(error);
    }
})

// delete task
router.delete('/tasks/:id', auth, async (req, res)=>{
    try{
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

        if(!task)
            return res.status(404).send();
        res.send(task);
    }catch(error){
        res.status(400).send(error);
    }
})

export default router;