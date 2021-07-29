const express = require('express');
const Database = require('../connections/database');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const database = new Database();
  let stockNo = req.params.id;
  let day = req.query.day;

  try{
    let result = await database.query(`SELECT stock_name, chips FROM ${process.env.DB_CHIP_TABLE} WHERE stock_no="${stockNo}"`);
    if(!result.length) throw new Error('查無此股號');
    let stockChips = JSON.parse(result[0].chips);
    if(stockChips.length < day) day = stockChips.length;
    let stock = {
      stockNo: stockNo,
      stockName: result[0].stock_name,
      data: stockChips.slice(0, day),
    }
    res.send({data: stock});
  }
  catch(err){
    res.status(422).send({message:err.message});
  }
  database.end();
})

module.exports = router;