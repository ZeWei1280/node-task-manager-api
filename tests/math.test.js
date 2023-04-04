import {calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add} from "../src/math.js"
// const {calculateTip} = require ("../src/math.js");


test('Should calculate total with tip', ()=>{
    const total = calculateTip(10, .3)
    // if(total!== 13){
    //     throw new Error('Total tip shouls be 13. Got ' + total);
    // }
    expect(total).toBe(13); // https://jestjs.io/docs/expect 更多功能
})

test("Should calculate total with default tip", ()=>{
    const total = calculateTip(10);
    expect(total).toBe(12.5);
})

test("Should convert 32 F to 0 C" , ()=>{
    const res = fahrenheitToCelsius(32);
    expect(res).toBe(0);
})

test("Should convert 0 C to 32 F", ()=>{
    const res = celsiusToFahrenheit(0);
    expect(res).toBe(32);
})

// test('Async test demo',async ()=>{ //test一樣要考慮async的問題，不然一樣會錯誤結果
//     await setTimeout(()=>{
//         expect(1).toBe(2);
//     }, 2000)
// })

test('Should add two numbers', (done)=>{
    add(2, 3).then(sum =>{
        expect(sum).toBe(5);
        done();
    })
})

test('Should add two numbers async/await', async ()=>{
    const res = await add(2, 3);
    expect(res).toBe(5);
})