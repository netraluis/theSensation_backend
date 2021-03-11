const express = require('express');

const morgan = require('morgan');
const cors = require('cors');

const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

const bookingsRouter = require('./routes/stripeRoutes');
const userRouter = require('./routes/userRoutes');
// const reviewRouter = require('./routes/reviewRoutes');


const app = express();
app.use(cors({origin:'*'}));
//-----------------------------------------1) GLOBAL Middleware------------------------------

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limiter requues flom same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in a hour!',
});

app.use('/api', limiter);
//esto es para que se pueda usar req.body es un middleware con limite de peso
app.use(express.json({ limit: '10kb' }));


//servir páginas estáticas desde el folder
app.use(express.static(`${__dirname}/public`));

// //-----------------------------------------1)Routes------------------------------
console.log('llego')
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);

//creamos un middleware para cuando se coloca una url erronea
app.use('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
