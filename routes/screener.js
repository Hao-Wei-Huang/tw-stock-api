const express = require('express');
const Database = require('../connections/database');
const screenStocks = require('../stock/screenStocks');

const router = express.Router();

router.post('/', async (req, res) => {
  let data = req.body;
  if(!data.length) res.status(422).send({success:false, message:'資料不正確'});
  let database = new Database();
  let filteredStocks1;
  let filteredStocks2;
  let intersectionStocks = {};
  let screenedStocks = [];

  try{
    filteredStocks1 = await screenStocks('', data[0]);
    for(let i = 1; i < data.length; i++){
      filteredStocks2 = await screenStocks('', data[i]);
      for(let key in filteredStocks1){
        if(filteredStocks2[key]){
          intersectionStocks[key] = [...filteredStocks1[key], ...filteredStocks2[key]];
        }
      }
      filteredStocks1 = intersectionStocks;
      // Check the filtered stocks are empty.
      if(Object.keys(filteredStocks1).length === 0) break;
      intersectionStocks = {};
    }
    for(let stockNo in filteredStocks1){
      let result = await database.query(`SELECT stock_name, prices FROM ${process.env.DB_TECH_TABLE} WHERE stock_no="${stockNo}"`);
      if(!result.length) continue;
      let stockPrices = JSON.parse(result[0].prices);
      if(!stockPrices.length)continue;
      screenedStocks.push({
        stockNo,
        stockName: result[0].stock_name,
        closingPrice: stockPrices[0].closingPrice,
        conditions: filteredStocks1[stockNo]
      });
    }
    res.send({data: screenedStocks});
  }
  catch(err){
    res.status(422).send({success:false, message:err.message});
  }
  database.end();
});

module.exports = router;