const router = require('express').Router();
const passport = require('passport');

const Item = require('../../models/Item');
const validateItem = require('../../validation/item');


router.post('/create', (req, res) => {
        let {errors, isValid} = validateItem(req.body);
        if(!isValid){
            return res.status(400).json(errors);
        }
        
        let item = new Item({
            name: req.body.name,
            price: Number(req.body.price)
        })

        item.save()
            .then(item => {
                return res.json({msg: `Item with the ID ${item._id} is created successfully`});
            })
            .catch(err => {
                return res.status(400).json({err: err.message});
            }); 
    })


router.get('/',
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        Item.find({status: true})
            .then(items => {
                if(!items) return res.status(400).json({msg: "No items to display"});
                return res.json(items);
            })
            .catch(err => {return res.status(400).json({err: err.message})})
});
module.exports = router;