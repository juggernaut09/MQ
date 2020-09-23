const router = require('express').Router();
const Token = require('../../models/Token');
const User = require('../../models/User');
const sgMail = require('@sendgrid/mail')
var crypto = require('crypto');

router.get('/confirmation/:token', (req, res) => {
    Token.findOne({token: req.params.token.replace('.', ' ')}, (err, token) => {
        if(err) return res.status(400).json(err);
        if (!token) return res.status(400).json({ msg: "We were unable to find a valid token. Your token my have expired." });

        User.findOne({_id: token.user_id, status: true}, (err, user) => {
            if(err) return res.status(400).json(err);

            // Chcek the token is valid or not
            if (!user) return res.status(400).json({ msg: "We were unable to find a user for this token." });

            // Check if user token is already verified
            if (user.verified) return res.status(400).json({ msg: "User already verified"});
            
            // update the user to verified
            user.verified = true;
            user.save((err) => {
                if(err) return res.status(400).json(err);
                return res.json({ msg: "The account has been verified. Please log in."});
            });
        });
    });
});

router.get('/resend/:user_id', (req, res) => {
    User.findOne({_id: req.params.user_id, status: true}, (err, user) => {
        if(err) return res.status(400).json({err});
        if(!user) return res.status(400).json({ msg: "Invalid user_id"});
        if(user.verified) return res.status(400).json({ msg: "Email is already verified"});

        Token.deleteMany({user_id: user._id}, (err) => {
            if(err) return res.status(400).json(err);

            const token = new Token({user_id: user._id, token: crypto.randomBytes(16).toString('hex') });
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
                                return res.status(400).json({error: err.response.body.errors[0].message})
                            });
                })
                .catch(err => {return res.status(400).json({error: err.message})});
        })
        
    })
});
module.exports = router;