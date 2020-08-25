const mongoose = require('mongoose');
const questions = require('./routes/technicalqq');
const users = require('./routes/users');
const cors = require('cors');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/codebot', {useNewUrlParser:true,useUnifiedTopology:true})
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use(cors()) // Use this after the variable declaration
app.use('/api/questions', questions);
app.use('/api/users', users);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));