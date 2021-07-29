const express = require('express');
const Database = require('../connections/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.get('/', async (req, res) => {
  const database = new Database();
  const uuid = req.session.uuid;

  try{
    let result = await database.query(`SELECT tracked_stocks FROM ${process.env.DB_AUTH_TABLE} WHERE uuid="${uuid}"`);
    if(!result.length) throw new Error('uuid 錯誤');
    let trackedStocks = JSON.parse(result[0].tracked_stocks);
    result = await database.query(`SELECT stock_no, stock_name, prices FROM
      ${process.env.DB_TECH_TABLE} WHERE FIND_IN_SET(stock_no, '${trackedStocks.join(',')}')`);
    trackedStocks = result.map(item => {
      let stockPrices = JSON.parse(item.prices);
      return {
        stockNo: item.stock_no,
        stockName: item.stock_name,
        closingPrice: stockPrices.length ? stockPrices[0].closingPrice : 0,
        upDown: stockPrices.length ? stockPrices[0].upDown : 0,
        capacity: stockPrices.length ? stockPrices[0].capacity : 0,
      }
    });
    res.send({data:trackedStocks});
  }
  catch(err){
    res.status(422).send({message: err.message});
  }
});

router.post('/', body('trackedStock').isLength({min: 1}), async (req, res) => {
  const database = new Database();
  const uuid = req.session.uuid;
  const errors = validationResult(req);

  try{
    if(!errors.isEmpty()) throw new Error(errors.array().map(item => item.msg).join(','));
    let trackedStock = req.body.trackedStock;
    let result = await database.query(`SELECT tracked_stocks FROM ${process.env.DB_AUTH_TABLE} WHERE uuid="${uuid}"`);
    let trackedStocks = JSON.parse(result[0].tracked_stocks);
    if(trackedStocks.indexOf(trackedStock) === -1) trackedStocks.push(trackedStock);
    await database.query(`UPDATE ${process.env.DB_AUTH_TABLE} SET tracked_stocks='${JSON.stringify(trackedStocks)}' WHERE uuid="${uuid}"`);
    res.send({data: trackedStock});
  }
  catch(err){
    res.send({message: err.message});
  }
});

router.delete('/', body('trackedStock').isLength({min: 1}), async (req, res) => {
  const database = new Database();
  const uuid = req.session.uuid;
  const errors = validationResult(req);

  try{
    if(!errors.isEmpty()) throw new Error(errors.array().map(item => item.msg).join(','));
    let trackedStock = req.body.trackedStock;
    let result = await database.query(`SELECT tracked_stocks FROM ${process.env.DB_AUTH_TABLE} WHERE uuid="${uuid}"`);
    let trackedStocks = JSON.parse(result[0].tracked_stocks);
    let trackedStockIndex = trackedStocks.indexOf(trackedStock);
    if(trackedStockIndex !== -1) trackedStocks.splice(trackedStockIndex, 1);
    await database.query(`UPDATE ${process.env.DB_AUTH_TABLE} SET tracked_stocks='${JSON.stringify(trackedStocks)}' WHERE uuid="${uuid}"`);
    res.send({data: trackedStock});
  }
  catch(err){
    res.send({message: err.message});
  }
});


module.exports = router;