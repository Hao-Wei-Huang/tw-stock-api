const express = require('express');
const Database = require('../connections/database');

const router = express.Router();

router.get('/:id', async(req, res) =>{
  const database = new Database();
  let stockNo = req.params.id;
  try{
    let result = await database.query(`SELECT stock_no FROM 
      ${process.env.DB_COMPANY_TABLE} WHERE stock_no="${stockNo}"`);
    let isStockNo = result.length ? true : false;
    res.send({data: {isStockNo}});
  }
  catch(err){
    res.status(422).send({success:false, message:err.message});
  }
});

module.exports = router;