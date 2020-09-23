const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    user_name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
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
    subscribed: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    }

});

module.exports = mongoose.model("User", userSchema);