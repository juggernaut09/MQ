const mongoose = require("mongoose");
const {Schema} = mongoose;

const tokenSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now, expires: 43200 }
});

module.exports = mongoose.model("Token", tokenSchema);