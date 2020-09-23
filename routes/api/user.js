const express = require('express');
var crypto = require('crypto');
const sgMail = require('@sendgrid/mail')
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const passport = require('passport');
const validateSignupInput = require('../../validation/signup');
const validateLoginInput = require('../../validation/login');

const User = require('../../models/User');
const Token = require('../../models/Token');
router.post('/signup', (req, res) => {
    const {errors, isValid} = validateSignupInput(req.body);
    const {user_name, password, email} = req.body;

    if(!isValid){
        return res.status(400).json(errors);
    }
    User.findOne({$or: [{email}, {user_name}], status: true})
        .then(user => {
            if(user) {
                if(user.email === email){
                    if(!user.verified){
                        return res.status(400).json({
                            message: "Email already exists, Please verify your Email to login"
                        });
                    }
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }
                else {
                    return res.status(400).json({
                        message: "User name already exists"
                    });
                }
            }
            else {
                const newUser = new User({user_name, email, password});
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                                .then(user => {
                                    var token = new Token({ user_id: user._id, token: crypto.randomBytes(16).toString('hex') });
                                    token.save()
                                         .then(() => {
                                            const msg = {
                                                to: user.email,
                                                from: process.env.SENDER_EMAIL,
                                                subject: 'Email verification from Market front',
                                                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/token\/confirmation\/' + token.token + '\n',
                                              }
                                              sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                                              sgMail.send(msg)
                                                    .then(() => {
                                                        return res.json({message: "We have sent an verification email please verify that to login."})
                                                    })
                                                    .catch(err => {
                                                        return res.status(400).json({error: err})
                                                    });
                                         })
                                         .catch(err => {return res.status(400).json({error: err.message})}); 
                                    
                                    
                                })
                                .catch(err => {return res.status(400).json({error: err.message})});
                    });
                });
            }
        });
});

router.get('/:id',
        passport.authenticate("jwt", {session: false}),
        (req, res) => {
            User.findOne({_id: req.params.id, status: true}, (err, user) => {
                if(err) return res.status(400).json({error: err.message});
                if(!user) return res.status(400).json({error: "Invalid user-id"});
                return res.json({
                    _id: user._id,
                    subscribed: user.subscribed,
                    verified: user.verified,
                    email: user.email,
                    user_name: user.user_name,
                    status: user.status,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    deleted_at: user.deleted_at
                });
            });
        });

router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);
    const {email, password} = req.body;

    if(!isValid){
        return res.status(400).json(errors);
    }
    User.findOne({email})
        .then(user => {
            if(!user) {
                return res.status(404).json({email: "Email not found"});
            }
            bcrypt.compare(password, user.password)
                  .then(isMatch => {
                    if(isMatch){
                        if(!user.verified){
                            return res.status(400).json({email: "Please verify your Email to login"})
                        }
                        const payLoad = {
                            id: user.id,
                            user_name: user.user_name
                        };
                        jwt.sign(payLoad, SECRET, { expiresIn: 3600}, (err, token) => {
                            if(err){
                                return res.status(400).json({error: err});
                            }
                            return res.json({
                                success: true,
                                token : "Bearer "+ token
                            });
                        });
                        
                    } else {
                        return res.status(400).json({ password: "Password Incorrect" });
                    }
                  });

        });
});
module.exports = router;
