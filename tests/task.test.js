import request from "supertest"
import Task from "../src/models/task"
import app from "../src/app"
import {userOne, userOneId, setupDatabase} from  "./fixtures/db.js"

beforeEach(setupDatabase);

test('Should creat task for user',  async ()=>{
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);

        const task = await Task.findById(response.body._id)
        expect(task).not.toBeNull();
})