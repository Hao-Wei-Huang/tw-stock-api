const express = require('express');
const Database = require('../connections/database');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const database = new Database();
  let stockNo = req.params.id;

  try{
    let result = await database.query(`SELECT * FROM ${process.env.DB_COMPANY_TABLE} WHERE stock_no="${stockNo}"`)
    if(!result.length) throw new Error('查無此股號');
    res.send({
      data: {
        stockNo: result[0].stock_no,
        stockName: result[0].stock_name,
        type: result[0].type,
        industryCategory: result[0].industry_category,
        address: result[0].address,
        website: result[0].website,
      }
    });
  }
  catch(err){
    res.status(422).send({message:err.message});
  }
  database.end();
});

module.exports = router;