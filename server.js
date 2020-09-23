const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Binding app with express
const app = express();

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport middleware
const passport = require("passport");
app.use(passport.initialize());
require("./middleware/passport")(passport);

// Mongo connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => console.log("Mongo Connection Successfull"))
        .catch((err) => console.log(`err : ${err}`));

// Index Route 
app.get('/', (req, res) => {
    res.json("hello");
});

// api Routes
const userRouter = require('./routes/api/user');
const tokenRouter = require('./routes/api/token');
const itemRouter = require('./routes/api/item');
app.use('/api/users/', userRouter);
app.use('/token/', tokenRouter);
app.use('/api/item', itemRouter);

// service Routes
const orderRouter = require('./routes/api/orders');

app.use('/services/order/', orderRouter);

// Running the server
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});