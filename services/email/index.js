const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const nodemailer = require('nodemailer');
require('dotenv').config();
const sgMail = require('@sendgrid/mail')


// Configure the region
AWS.config.update({region: 'us-east-2'});
const queueUrl = process.env.SQS_QUEUE_URL;

const sendMail = (message) => {
    let sqsMessage = JSON.parse(message.Body);
    const emailMessage = {
        from: process.env.SENDER_EMAIL,    // Sender address
        to: sqsMessage.userEmail,     // Recipient address
        subject: 'Order Received | MarketFront',    // Subject line
        html: `<p>Hi ${sqsMessage.userEmail}.</p. <p>Your order of ${sqsMessage.itemsQuantity} ${sqsMessage.itemName} has been received and is being processed.</p> <p> Thank you for shopping with us! </p>` // Plain text body
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send(emailMessage)
        .then(() => {
            console.log(`Successfully sent message to email ${sqsMessage.userEmail}`);
        })
        .catch(err => {
            return res.status(400).json({error: err.response.body.errors[0].message})
        });
}

// Create our consumer
console.log("queueUrl", process.env.SQS_QUEUE_URL);
const app = Consumer.create({
    queueUrl: queueUrl,
    handleMessage: async (message) => {
        sendMail(message);
    },
    sqs: new AWS.SQS()
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

console.log(`Emails service is running at port ${process.env.SMTP_PORT}`);
app.start();