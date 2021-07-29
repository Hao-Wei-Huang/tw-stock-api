const express = require('express');
const Database = require('../connections/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const userInfoValidation = [
  body('name').trim().isLength({ min: 1 }).escape(),
  body('email','Email Must Be an Email Address')
  .trim().isEmail().escape().normalizeEmail(),
  body('choseStockEmailNotification').exists(),
]

router.get('/user/info', async (req, res) => {
  const database = new Database();
  const uuid = req.session.uuid;

  try{
    let result = await database.query(`SELECT name, email, chose_stock_email_notification FROM ${process.env.DB_AUTH_TABLE} WHERE uuid="${uuid}"`);
    res.send({data: {
      name: result[0].name, 
      email: result[0].email, 
      choseStockEmailNotification: result[0].chose_stock_email_notification
    }});
  }
  catch(err){
    res.send({message: err.message});
  }
});

router.post('/user/info', userInfoValidation, async (req, res) => {
  const errors = validationResult(req);
  const database = new Database();
  const uuid = req.session.uuid;

  try{
    if(!errors.isEmpty()) throw new Error(errors.array().map(item => item.msg).join(','));
    const email = req.body.email;
    const name = req.body.name;
    const choseStockEmailNotification = req.body.choseStockEmailNotification;
    // Find if the email had been registered.
    let result = await database.query(`SELECT uuid FROM ${process.env.DB_AUTH_TABLE} WHERE email="${email}" AND uuid!="${uuid}"`);
    // The email had been registered.
    if(result.length !== 0) throw new Error('該電子信箱已註冊');
    await database.query(`UPDATE ${process.env.DB_AUTH_TABLE} 
      SET email="${email}" ,name="${name}", 
      chose_stock_email_notification="${choseStockEmailNotification}"
      WHERE uuid="${uuid}"`);
    res.send({data: {name, email, choseStockEmailNotification}});
  }
  catch(err){
    res.send({message: err.message});
  }
});

module.exports = router;