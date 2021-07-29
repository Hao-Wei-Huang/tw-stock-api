const express = require('express');
const Database = require('../connections/database');

const router = express.Router();

router.get('/', async(req, res) =>{
  const database = new Database();
  let term = req.query.term;
  try{
    let result = await database.query(`SELECT stock_no, stock_name FROM 
    ${process.env.DB_COMPANY_TABLE} WHERE stock_no LIKE "${term}%" OR 
    stock_name LIKE "%${term}%"`);
    let stocks = result.map(itme => {
      return {
        stockNo: itme.stock_no, 
        stockName: itme.stock_name
      };
    })
    res.send({data: stocks});
  }
  catch(err){
    res.status(422).send({success:false, message:err.message});
  }
});

module.exports = router;