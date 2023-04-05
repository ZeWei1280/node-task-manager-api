import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/user.js'
import { userOne, userOneId, setupDatabase } from './fixtures/db.js'

// beforeEach(setupDatabase);
beforeEach(async ()=>{
    await setupDatabase();
})
//
// beforeAll、afterAll 
// afterEach(()=>{
//     console.log('after each')
// })

test('Sould signup a new user', async ()=>{
    // response包含status, head, body
    const response = await request(app)
        .post('/users').send({
            name: 'Vic', 
            email: 'hahaha@example.com',
            password: '1234241414!'
        })
        .expect(201); // expect只會去check status，若status不同，則throw Error，不會更改任何response內容


    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull();

    // Assertion about the response
    expect(response.body).toMatchObject({ // 比對 object
        user:{
            name: 'Vic',
            email: 'hahaha@example.com'
        },
        token: user.tokens[0].token
    });

    // 確認是否加密過
    expect(user.password).not.toBe('1234241414!');
})

test('Should login existing user', async ()=>{
    const response = await request(app)
        .post('/users/login').send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    // 
    const user = await User.findById(userOneId);
    expect(user).not.toBeNull();
    expect(user.tokens[1].token).toBe(response.body.token);
})

test('Should not login nonexistentuser', async ()=>{
    await request(app).post('/users/login').send({
        email: "aass@gmm.com",
        password: "sdas"
    }).expect(400);
})

test('Should get profile for user', async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not get profile for unauthencated user', async()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
})

test('Should delete account for user', async()=>{
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthencated user', async()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should uoload avatar image', async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg') //attach(命名, 路徑)會在此請求附加上local端的檔案
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer)); //要比較兩object內容時，不能用tobe(===)，要用toEquqal

})

test('Should update valid user fields', async ()=>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'hha'
        })
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user.name).toEqual('hha');
})

test('Should not update invalid user fields', async ()=>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'hha'
        })
        .expect(400);
})