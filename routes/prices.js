const express = require('express');
const Database = require('../connections/database');

const router = express.Router();

router.get('/:id', async(req, res) => {
  const database = new Database();
  let stockNo = req.params.id;
  let day = req.query.day;

  try{
    let result = await database.query(`SELECT stock_name, prices FROM 
    ${process.env.DB_TECH_TABLE} WHERE stock_no="${stockNo}"`);
    if(!result.length) throw new Error('查無此股號');
    let stockPrices = JSON.parse(result[0].prices);
    if(stockPrices.length < day) day = stockPrices.length;
    let stock = {
      stockNo: stockNo,
      stockName: result[0].stock_name,
      data: stockPrices.slice(0, day),
    }
    res.send({data: stock});
  }catch(err){
    res.status(422).send({message:err.message});
  }
  database.end();
});

module.exports = router;