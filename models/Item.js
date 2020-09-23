const mongoose = require('mongoose');

const {Schema} = mongoose;

const itemSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    price : {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: null
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
    },
    status: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("Item", itemSchema);