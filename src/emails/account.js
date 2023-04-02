import Mailgun from 'mailgun.js';
import formData from 'form-data'; //node_modules裡面有，不需要安裝

// ---- 
const mailgun = new Mailgun(formData);
const client = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

const sendWelcomeEmail = (email, name) =>{
    const messageData = {
        from: 'a22558846@gmail.com',
        to: email,
        subject: 'Hello',
        text: `Welcome to the app , ${name}. Let me know how you get along with this app.`
    };
    client.messages.create(process.env.MAILGUN_DOMAIN, messageData);
}


const sendLastEmail = (email, name) =>{
    const messageData = {
        from: 'a22558846@gmail.com',
        to: email,
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}! I hope to see you back sometime soon.`
    };
    client.messages.create(process.env.MAILGUN_DOMAIN, messageData);
}

// client.messages.create(DOMAIN, messageData)
//  .then((res) => {
//    console.log(res);
//  })
//  .catch((err) => {
//    console.error(err);
//  });


export {
    sendWelcomeEmail, 
    sendLastEmail
};