const express = require('express');
const screenStocks = require('../stock/screen-stocks');

const router = express.Router();

router.get('/:id', async (req, res) => {
  let stockNo = req.params.id;
  let conditions = [
    {
      'type': 'ascendingOrder',
      'tm': '',
      'op': '',
      'val': ''
    },
    {
      'type': 'capacity',
      'tm': 5,
      'op': 0,
      'val': 50
    },
    {
      'type': 'foreignInvestorBS',
      'tm': 3,
      'op': 1,
      'val': 200
    },
    {
      'type': 'investmentTrustBS',
      'tm': 3,
      'op': 1,
      'val': 200
    },
    {
      'type': 'foreignInvestorCB',
      'tm': 3,
      'op': '',
      'val': ''
    },
    {
      'type': 'investmentTrustCB',
      'tm': 3,
      'op': '',
      'val': ''
    },
    {
      'type': 'monthlyRevenueYoY',
      'tm': 3,
      'op': 1,
      'val': 20
    },
    {
      'type': 'threeRatio',
      'tm': 1,
      'op': '',
      'val': ''
    },
    {
      'type': 'epsGrowthRatio',
      'tm': 1,
      'op': 1,
      'val': 10
    }
  ];
  let remarks = {
    'ascendingOrder': '均線呈多頭排列，走勢相當強勢。',
    'capacity': '成交量急縮，籌碼穩定，蓄勢待發。',
    'foreignInvestorBS': '外資籌碼集中，短期相當看好。',
    'investmentTrustBS': '投信籌碼集中，短期相當看好。',
    'foreignInvestorCB': '外資籌碼不斷進駐，買盤積極。',
    'investmentTrustCB': '投信籌碼不斷進駐，買盤積極。',
    'monthlyRevenueYoY': '月營收年增相當強勁，與去年營收相比屢屢創高。',
    'threeRatio': '毛利率、營益率、淨利率都有顯著提升，企業經營十分良好。',
    'epsGrowthRatio': 'EPS 成長率增加，企業營收能力增強。',
  };
  let screenedStock = {
    stockNo,
    score: 0,
    data:[],
  }

  try{
    for(let i = 0; i < conditions.length; i++){
      let result = await screenStocks(stockNo, conditions[i]);
      if(result[stockNo]){
        let condition = result[stockNo][0];
        condition.remark = remarks[condition.type];
        screenedStock.data.push(condition);
      }
    }
    screenedStock.score = Math.ceil(screenedStock.data.length / conditions.length * 10);
    res.send({data: screenedStock});
  }
  catch(err){
    res.status(422).send({message:err.message});
  }
});

module.exports = router;