import request from 'supertest';
import app from '../src/app';
import Task from '../src/models/task';
import {userOne, setupDatabase , userTwo, taskOne} from './fixtures/db.js';

beforeEach(setupDatabase);
// beforeEach(async ()=>{
//     await setupDatabase();
// })

// 確保執行user.test和task.test順序
// 在package.json加上 --runInBand
test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);
    
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false); // toBe也可
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    const tasks = response.body;
    expect(tasks.length).toEqual(2);
})

test('DShould not delete other user tasks', async()=>{
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

        const task = Task.findById(taskOne._id)
        expect(task).not.toBeNull();
})