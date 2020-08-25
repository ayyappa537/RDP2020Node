const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const User = mongoose.model('User', new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  userType: {
    type: String,
    required: true,
    minlength: 5,
    default: "Developer",
    maxlength: 255
  },
  createdBy: String,
  createDate: {
    type: Date,
    default: Date.now
  },
  modifiedBy: String,
  modifiedDate: {
    type: Date
  }
}));

// Retrieve All Users.
router.get('/', async (req, res) => {
  const questions = await User.find().sort('userName');
  res.send(questions);
});

// Create New User.
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let question = new User({ 
    userName: req.body.userName,
    password: req.body.password,
    userType: req.body.userType,
    createdBy: req.body.createdBy 
  });
  question = await question.save();
  
  res.send(question);
});


router.post('/login', async (req, res) => {
    const { error } = validateUser(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    const user = await getUsers(req.body);
    if(user.length == 0) return res.send({isValid:false});
    res.send({isValid:true,user:user[0]});
  });

  async function getUsers(data) {
    return await User
    .find()
    .and([{ userName:data.userName}, {password: data.password}])
    .sort('userName')
    .select('userName password userType');
  }

router.put('/:id', async (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  if(!req.body.modifiedBy) return res.status(400).send("TO Update we need ModifiedBy.");

  try{
    const user = await User.findByIdAndUpdate(req.params.id, { password:req.body.password, 
                                    userType:req.body.userType,modifiedBy:req.body.modifiedBy}, {
        new: true,
        useFindAndModify:false
      });
  
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    
    res.send(user);
  }catch(ex){
    console.log('error',ex.error);
    for( field in ex.error)
      console.log(ex.error[field].message);
      return res.status(404).send('The user with the given ID was not found.');
  }
});

router.delete('/:id', async (req, res) => {
  
  try{
    const question = await User.findByIdAndRemove(req.params.id);
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
    const question = await User.findById(req.params.id);

    if (!question) return res.status(404).send('The question with the given ID was not found.');
  
    res.send(question);
  }catch(ex){
    console.log('error',ex.error);
    for( field in ex.error)
      console.log(ex.error[field].message);
      return res.status(404).send('The question with the given ID was not found.');
  }
});

function validateUser(user) {
  const schema = Joi.object({
    userName: Joi.string().min(3).required(),
    password: Joi.string().min(3).required(),
    userType: Joi.string().min(3),
    createdBy: Joi.string().min(3),
    modifiedBy: Joi.string().min(3)
  });
  return schema.validate(user);
}

module.exports = router;