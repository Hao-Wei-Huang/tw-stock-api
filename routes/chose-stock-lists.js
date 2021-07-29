const express = require('express');
const Database = require('../connections/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.get('/', async(req, res) =>{
  const database = new Database();
  const uuid = req.session.uuid;
  try{
    let result = await database.query(`SELECT chose_stock_lists FROM 
      ${process.env.DB_AUTH_TABLE} WHERE uuid="${uuid}"`);
    let choseStockLists = JSON.parse(result[0].chose_stock_lists);
    res.send({data: choseStockLists});
  }
  catch(err){
    res.status(422).send({success:false, message:err.message});
  }
});

router.post('/', body('choseStockLists').isLength({min: 1}), async(req, res) =>{
  const database = new Database();
  const uuid = req.session.uuid;
  const errors = validationResult(req);

  try{
    if(!errors.isEmpty()) throw new Error(errors.array().map(item => item.msg).join(','));
    const choseStockLists = req.body.choseStockLists;
    await database.query(`UPDATE  ${process.env.DB_AUTH_TABLE}
      SET chose_stock_lists='${JSON.stringify(choseStockLists)}' WHERE uuid="${uuid}"`);
    res.send({data: choseStockLists});
  }
  catch(err){
    res.status(422).send({success:false, message:err.message});
  }
});

module.exports = router;