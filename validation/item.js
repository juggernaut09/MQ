const {default:validator} = require('validator');
const isEmpty = require('is-empty');

validateItem = (data) => {
    let errors = {};

    let {name, price} = data;

    name = !validator.isEmpty(name) ? name : "";
    price = !validator.isEmpty(price) ? price : "";
    

    if(validator.isEmpty(name)){
        errors.name = "Item name cannot be empty";
    } else if(!validator.isLength(name, {min: 5, max: 100})) {
        errors.name = "Item name can be of a length between 5 to 100 characters";
    }
    if (validator.isEmpty(price)) {
        errors.price = "price is required";
     } else if (!validator.isNumeric(price)) {
        errors.price = "Enter a valid price";
     }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateItem;