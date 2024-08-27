const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// MIDDLEWARES ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Log incoming requests in dev mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Parse incoming requests with json payloads
app.use(express.json());

// Static files
app.use(express.static(`${__dirname}/public`));

// Print a message to the console when a request is received
app.use((req, res, next) => {
  console.log('Hello from the middleware ');
  next();
});

// Add a property to the request with the current time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ROUTES /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// app.get('/api/v1/tours', getAllTours); app.get('/api/v1/tours/:id', getTour); app.post('/api/v1/tours', createTour); app.patch('/api/v1/tours/:id', updateTour); app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
