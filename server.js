const mongoose = require('mongoose');
const dotenv = require('dotenv');
//configuro variables de entorno
dotenv.config({ path: './config.env' });

//conexion base de datos
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succesful!');
  });
process.on('uncaughtException', (err) => {
  console.log(`Error name: ${err.name}`, `.Error message: ${err.message}`);
  console.log('UNCAUGHT REJECTION');
  process.exit(1);
});
//configuraciones de variables glbales(dotenv.config) antes para poder acceder a las variables
const app = require('./app');
// console.log(app.get('env'));
// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App runin on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error name: ${err.name}`, `.Error message: ${err.message}`);
  console.log('UNHANDLED REJECTION');
  server.close(() => {
    process.exit(1);
  });
});