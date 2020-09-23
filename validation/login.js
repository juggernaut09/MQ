const { default: validator } = require("validator");
const isEmpty = require("is-empty");

validateLoginInput = (data) => {
    let errors = {}

    let {email, password} = data;

    email = !validator.isEmpty(email) ? email : "";
    password = !validator.isEmpty(password) ? password : "";

    if(validator.isEmpty(email)){
        errors.email = "Email is required";
    } else if(!validator.isEmail(email)){
        errors.email = "Please enter a valid email";
    }

    if(validator.isEmpty(password)){
        errors.password = "Password cannot be empty";
    } else if(!validator.isLength(password, {min: 6, max:30})){
        errors.password = "Password must be at least 6 characters";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };

};

module.exports = validateLoginInput;