const express = require('express');
const Database = require('../connections/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const auth = require('../middlewares/auth');

const router = express.Router();
const saltRounds = 10;

const loginValidation = [
  body('email','Email Must Be an Email Address')
  .trim().isEmail().escape().normalizeEmail(), 
  body('password').trim().isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters')
  .escape(),
];

router.post('/signup', loginValidation, body('name').trim().isLength({ min: 1 }).escape(), async (req, res) => {
  const errors = validationResult(req);
  const database = new Database();

  try{
    if(!errors.isEmpty()) throw new Error(errors.array().map(item => item.msg).join(','));
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let uuid = uuidv4();
    let hash = await bcrypt.hash(password, saltRounds);
    // Find if the email had been registered.
    let result = await database.query(`SELECT uuid FROM ${process.env.DB_AUTH_TABLE} WHERE email="${email}"`);
    // The email had been registered.
    if(result.length !== 0) throw new Error('該電子信箱已註冊');
    // Save uuid, email and password to database.
    await database.query(`INSERT INTO ${process.env.DB_AUTH_TABLE} 
      SET uuid="${uuid}",email="${email}",password="${hash}",name="${name}", 
      tracked_stocks="[]", 
      chose_stock_lists='[{"id":"清單 1","title":"清單 1","limit":10,"conditions":[]}, {"id":"清單 2","title":"清單 2","limit":10,"conditions":[]}, {"id":"清單 3","title":"清單 3","limit":10,"conditions":[]}]'`);
    // Send session id
    req.session.uuid = uuid;
    req.session.name = name;
    res.send({"message": "註冊成功", data: {name: req.session.name}});
  }
  catch(err){
    res.status(422).send({success:false, message:err.message});
  }
  database.end();
});

router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  const database = new Database();

  try{
    if(!errors.isEmpty()) throw new Error(errors.array().map(item => item.msg).join(','));
    // Find if the email had been registered.
    let result = await database.query(`SELECT uuid, password, name FROM ${process.env.DB_AUTH_TABLE} WHERE email="${req.body.email}"`)
    // The email wasn't registered.
    if(result.length === 0) throw new Error('帳號或密碼錯誤');
    // Verify the password.
    let isSame = await bcrypt.compare(req.body.password, result[0].password);
    if(isSame){
      req.session.uuid = result[0].uuid;
      req.session.name = result[0].name;
      res.send({message: "成功登入", data: {name: req.session.name}});
    }
    else{
      throw new Error('帳號或密碼錯誤');
    }
  }
  catch(err){
    res.status(422).send({success: false, message: err.message});
  }
  database.end();
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.send({message: "成功登出"});
});

router.post('/check', auth, (req, res) => {
  res.send({message: "驗證有效", data: {name: req.session.name}});
});

module.exports = router