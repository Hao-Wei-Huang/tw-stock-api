const express = require('express');
const Database = require('../connections/database');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const database = new Database();
  let stockNo = req.params.id;

  try{
    let result = await database.query(`SELECT * FROM
      ${process.env.DB_FUNDAMENT_TABLE} WHERE stock_no="${stockNo}"`);
    if(!result.length) throw new Error('查無此股號');
    let monthlyRevenues = JSON.parse(result[0].monthly_revenues);
    let EPSes = JSON.parse(result[0].EPSes);
    let yearEPS = 0;
    if(EPSes.length >= 4){
      for(let i = 0; i < 4; i++){
        yearEPS += EPSes[i].EPS;
      }
    }
    let stock = {
      stockNo,
      stockName: result[0].stock_name,
      data: [
        {
          monthlyRevenue: monthlyRevenues.length ? monthlyRevenues[0] : null,
          dividendYield: result[0].dividend_yield,
          yearEPS: Math.round(yearEPS * 100) / 100,
          PER: result[0].PER,
          PBR: result[0].PBR,
        } 
      ],
    }
    res.send({data: stock});
  }catch(err){
    res.status(422).send({message:err.message});
  }
  
});

module.exports = router;