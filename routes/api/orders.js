const router = require('express').Router();
const AWS = require('aws-sdk');
const passport = require('passport');
const Item = require('../../models/Item');
const Order = require('../../models/Order');

// Configure the region
AWS.config.update({region: 'us-east-2'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueUrl = process.env.SQS_QUEUE_URL;


// the new endpoint
router.post('/create', 
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Item.findOne({_id: req.body.item_id, status: true}, (err, item) => {
      if (err) return res.status(400).json({err: err.message});
      if(!item) return res.status(400).json({err: "Invalid item"});
      let orderData = {
        'userEmail': req.user.email,
        'itemName': item.name,
        'itemPrice': item.price,
        'itemsQuantity': req.body.quantity
      }
      let sqsOrderData = {
        MessageAttributes: {
          "userEmail": {
            DataType: "String",
            StringValue: req.user.email
          },
          "itemName": {
            DataType: "String",
            StringValue: item.name
          },
          "itemPrice": {
            DataType: "Number",
            StringValue: String(item.price)
            
          },
          "itemsQuantity": {
            DataType: "Number",
            StringValue: String(req.body.quantity)
          }
        },
        MessageBody: JSON.stringify(orderData),
        MessageDeduplicationId: req.user.email,
        MessageGroupId: "UserOrders",
        QueueUrl: queueUrl
    };
     // Send the order data to the SQS queue
    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
    sendSqsMessage.then((data) => {
      console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
      const order = new Order({
        user_id: req.user._id,
        item_id: item._id,
        MessageId: data.MessageId,
        quantity: Number(req.body.quantity),
        status: "placed"
      });
      order.save((err, order) => {
        if(err) return res.status(400).json({err: err.message});
        
        return res.json({
          order,
          message: "Your order has been confirmed please check you mail"
        });
      });
      
    }).catch((err) => {
      console.log(`OrdersSvc | ERROR: ${err}`);

      // Send email to emails API
      return res.status(400).send({err: "We ran into an error. Please try again."});
    });
    });
    
});


module.exports = router;