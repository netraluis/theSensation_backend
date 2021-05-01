// const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const signtoken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JTW_SECRET,
    {
      expiresIn: process.env.JTW_SECRET_EXPIRE_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signtoken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JTW_COOKIE_EXPIRE_IN * 60 * 1000
    ),
    //recibe la cookie y el navegador la guarda y la envia en cada request
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {

  const newUser = await User.create(req.body);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)Check if email and passwords exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2)Check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }
  //3)If everything ok send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) getting token and check if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not looged in', 401));
  }
  // 2) Verificaton token

  const decoded =
    //promisify viene del paquete util
    await promisify(jwt.verify)(token, process.env.JTW_SECRET);

  // 3) Check if user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) next(new AppError('The user does not exist.', 401));

  // 4) Check if user change password after the JWT  was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password please log in again', 401)
    );
  }

  //guardamos a currentUser
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //miramos en el array si esta alguno de los roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.updatePassword = catchAsync(async (req, res, next) => {
    const { passwordCurrent, newPassword } = req.body;
  
    // 1) Get user from the collection
    const user = await User.findById(req.user._id).select('+password');
    // 2) Check if POSTed current password is correct
    if (!user || !(await user.correctPassword(passwordCurrent, user.password))) {
      return next(new AppError('Incorrect password'), 401);
    }
    // 3) If so, update password
    user.password = newPassword;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  });