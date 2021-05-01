const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  role: {
    type: String,
    enum: ['worker', 'admin'],
    default: 'worker',
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'invalid email'],
  },
  password: {
    type: String,
    required: [true, 'Must use a password'],
    minlength: [8, 'password must have more or equal to 8'],
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now() - 1000
  },

});

userSchema.pre('save', async function (next) {
  //solo se ejecuta si el passwrd ha sido modificado
  if (!this.isModified('password')) return next();
  //encripta password con crypt coste 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;

  next();
});


userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  //this se refiere a una instancia de este documento y solo funciona en function()
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return changedTimestamp > JWTTimestamp;
  }
  return false;
};


const User = mongoose.model('User', userSchema);

module.exports = User;