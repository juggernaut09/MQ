const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const SECRET = process.env.SECRET;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET;

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findOne({_id: jwt_payload.id, status:true})
                .then(user => {
                    if(user){
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                })
                .catch(err => {
                    console.log({error: err.message});
                });
        })
    );
};