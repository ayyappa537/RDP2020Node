const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Question = mongoose.model('Question', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  answer: {
    type: String,
    minlength: 3,
    maxlength: 2000
  },
  createdBy: String,
  createDate: {
    type: Date,
    default: Date.now
  },
  modifiedBy: String,
  modifiedDate: {
    type: Date,
    default: function(){ if(this.modifiedBy)return Date.now}
  }
}));

router.get('/', async (req, res) => {
  const questions = await Question.find().sort('name');
  res.send(questions);
});

router.post('/', async (req, res) => {
  //const { error } = validateQuestion(req.body); 
  //if (error) return res.status(400).send(error.details[0].message);

  let question = new Question({ 
    name: req.body.name,
    answer: req.body.answer,
    createdBy: req.body.createdBy 
  });
  question = await question.save();
  
  res.send(question);
});

router.post('/search', async (req, res) => {
  const { error } = validateQuestion(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  const answer = await getQuestions(req.body);
  if(answer.length == 0) {
    let question = new Question({ 
      name: req.body.name,
      createdBy: req.body.createdBy 
    });
    question = await question.save();
    return res.send({status:false});
  }
  res.send({status:true,answer:answer});
});

async function getQuestions(data) {
  return await Question
  .find()
  .and([{ name:data.name}])
  .sort('name')
  .select('name answer');
}

router.put('/:id', async (req, res) => {
  const { error } = validateQuestion(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  try{
    const question = await Question.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
      new: true
    });
  
    if (!question) return res.status(404).send('The question with the given ID was not found.');
    
    res.send(question);
  }catch(ex){
    console.log('error',ex.error);
    for( field in ex.error)
      console.log(ex.error[field].message);
      return res.status(404).send('The question with the given ID was not found.');
  }
});

router.delete('/:id', async (req, res) => {
  
  try{
    const question = await Question.findByIdAndRemove(req.params.id);
    if (!question) return res.status(404).send('The question with the given ID was not found.');
  
    res.send(question);
  }catch(ex){
    console.log('error',ex.error);
    for( field in ex.error)
      console.log(ex.error[field].message);
      return res.status(404).send('The question with the given ID was not found.');
  }
});

router.get('/:id', async (req, res) => {
  try{
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).send('The question with the given ID was not found.');
  
    res.send(question);
  }catch(ex){
    console.log('error',ex.error);
    for( field in ex.error)
      console.log(ex.error[field].message);
      return res.status(404).send('The question with the given ID was not found.');
  }
});

function validateQuestion(question) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    createdBy: Joi.string().min(3)
  });

  return schema.validate(question);
}

module.exports = router;