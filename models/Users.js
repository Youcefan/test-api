const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var validator = require('validator');

const UsersSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'firstName is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique : true ,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: 'Field must be a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'password is required'],
  },
  avatar:{
    type: String,
    default: "uploads/test.png"
  }
  
});

const Users = mongoose.model("Users", UsersSchema);
module.exports = Users;
