const express = require('express');

const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

const userRouter = require('./routes/userRoutes');
const bookingsRouter = require('./routes/bookingRoute');


const app = express();
app.use(cors({origin:'*'}));
//-----------------------------------------1) GLOBAL Middleware------------------------------

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//esto es para que se pueda usar req.body es un middleware con limite de peso
app.use(express.json({ limit: '10kb' }));


//servir páginas estáticas desde el folder
app.use(express.static(`${__dirname}/public`));

// //-----------------------------------------1)Routes------------------------------
app.use('/prueba', (req,res,next)=>{
  res.status(200).json({
    status: 'funciona'
  })
})
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingsRouter);

//creamos un middleware para cuando se coloca una url erronea
app.use('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
