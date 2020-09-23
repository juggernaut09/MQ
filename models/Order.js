const mongoose = require('mongoose');

const {Schema} = mongoose;

const orderSchema = new Schema({
   user_id : {
       type: mongoose.Schema.Types.ObjectId,
       required: true, 
       ref: 'User'
   },
   item_id: {
       type: mongoose.Schema.Types.ObjectId,
       required: true,
       ref: 'Item'
   },
   MessageId: {
    type: String,
    required: true,
    default: null
   },
   status: {
       type: String,
       required: true,
       default: null
   },
   quantity: {
        type: Number,
        required: true,
        default: 1
   },
   created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: null
    },
    deleted_at: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("Order", orderSchema);