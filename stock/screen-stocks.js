const Database = require('../connections/database');

module.exports = function screenStocks(stockNo, condition){
  return new Promise(async (resolve, reject) => {
    const database = new Database();
    let screenedStocks = {};

    try{
      switch(condition.type){
        case 'ascendingOrder': {
          let result = await database.query(`SELECT stock_no FROM ${process.env.DB_TECH_TABLE} 
            where price_5ma >= price_10ma and price_10ma >= price_20ma 
            and price_5ma >=0 and price_10ma >=0 and price_20ma >=0 
            and IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            screenedStocks[item.stock_no] = [{
              type: condition.type,
              tm: '',
              val: '',
            }]
          })
          break;
        }
        case 'descendingOrder': {
          let result = await database.query(`SELECT stock_no FROM ${process.env.DB_TECH_TABLE} 
            where price_5ma <= price_10ma and price_10ma <= price_20ma 
            and price_5ma >=0 and price_10ma >=0 and price_20ma >=0
            and IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            screenedStocks[item.stock_no] = [{
              type: condition.type,
              tm: '',
              val: '',
            }]
          })
          break;
        }
        case 'capacity': {
          let capacityProperty = 'capacity_5ma';
          if(condition.tm === 5) capacityProperty = 'capacity_5ma';
          else if(condition.tm === 10) capacityProperty = 'capacity_10ma';
          else if(condition.tm === 20) capacityProperty = 'capacity_20ma';
          let result = await database.query(`SELECT stock_no, prices, 
          ${capacityProperty} FROM ${process.env.DB_TECH_TABLE}
          WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let capacityMA = item[capacityProperty] || -1;
            let stockPrices = JSON.parse(item.prices);
            if(capacityMA === -1 || !stockPrices.length) return;
            let capacity = stockPrices[0].capacity;
            let val = Math.round((capacity / capacityMA) * 10000) / 100;
            // Check if the condition is met.
            let isMeet = condition.op === 0 ? val <= condition.val : val >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: val,
              }];
            }
          })
          break;
        }
        case 'BIAS': {
          let priceProperty = 'price_5ma';
          if(condition.tm === 5) priceProperty = 'price_5ma';
          else if(condition.tm === 10) priceProperty = 'price_10ma';
          else if(condition.tm === 20) priceProperty = 'price_20ma';
          let result = await database.query(`SELECT stock_no, prices, 
          ${priceProperty} FROM ${process.env.DB_TECH_TABLE}
          WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let priceMA = item[priceProperty] || -1;
            let stockPrices = JSON.parse(item.prices);
            if(priceMA === -1 || !stockPrices.length) return;
            let closingPrice = stockPrices[0].closingPrice;
            let val = Math.round(((closingPrice -  priceMA) / priceMA) * 10000) / 100;
            // Check if the condition is met.
            let isMeet = condition.op === 0 ? val <= condition.val : val >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: val,
              }];
            }
          })
          break;
        }
        case 'K': {
          let result = await database.query(`SELECT stock_no, Ks 
            FROM ${process.env.DB_TECH_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const Ks = JSON.parse(item.Ks);
            if(!Ks.length) return;
            const isMeet = condition.op === 0 ? Ks[0] <= condition.val :  Ks[0] >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: Ks[0],
              }];
            }
          });
          break;
        }
        case 'D': {
          let result = await database.query(`SELECT stock_no, Ds 
            FROM ${process.env.DB_TECH_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const Ds = JSON.parse(item.Ds);
            if(!Ds.length) return;
            const isMeet = condition.op === 0 ? Ds[0] <= condition.val :  Ds[0] >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: Ds[0],
              }];
            }
          });
          break;
        }
        case 'KDGoldenCross': {
          let result = await database.query(`SELECT stock_no, Ks, Ds 
            FROM ${process.env.DB_TECH_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const Ks = JSON.parse(item.Ks);
            const Ds = JSON.parse(item.Ds);
            if(Ks.length < 2) return;
            const isMeet = Ks[0] > Ds[0] && Ks[1] < Ds[1];
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: '',
                val: '',
              }];
            }
          });
          break;
        }
        case 'RSI': {
          let RSIN = 'RSI6s';
          if(condition.tm === 6) RSIN = 'RSI6s';
          if(condition.tm === 12) RSIN = 'RSI12s';
          let result = await database.query(`SELECT stock_no, ${RSIN} 
            FROM ${process.env.DB_TECH_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const RSINs = JSON.parse(item[RSIN]);
            if(!RSINs.length) return;
            const isMeet = condition.op === 0 ? RSINs[0].RSI <= condition.val : RSINs[0].RSI >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: RSINs[0].RSI,
              }];
            }
          });
          break;
        }
        case 'RSIGoldenCross': {
          let result = await database.query(`SELECT stock_no, RSI6s, RSI12s 
          FROM ${process.env.DB_TECH_TABLE} 
          WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const RSI6s = JSON.parse(item.RSI6s);
            const RSI12s = JSON.parse(item.RSI12s);
            if(RSI6s.length < 2) return;
            const isMeet = RSI6s[0].RSI > RSI12s[0].RSI && RSI6s[1].RSI < RSI12s[1].RSI;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: '',
                val: '',
              }];
            }
          });
          break;
        }
        case 'MACDGoldenCross': {
          let result = await database.query(`SELECT stock_no, DIFs, MACDs 
            FROM ${process.env.DB_TECH_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const DIFs = JSON.parse(item.DIFs);
            const MACDs = JSON.parse(item.MACDs);
            if(DIFs.length < 2) return;
            const isMeet = DIFs[0] > MACDs[0] && DIFs[1] < MACDs[1];
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: '',
                val: '',
              }];
            }
          });
          break;
        }
        case 'bollingerBand': {
          let result = await database.query(`SELECT stock_no, prices, bollingerBands 
            FROM ${process.env.DB_TECH_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const bollingerBands = JSON.parse(item.bollingerBands);
            const prices = JSON.parse(item.prices);
            if(!bollingerBands.length) return;
            let bollingerLine = 'middle';
            switch(condition.val){
              case '上軌道':{
                bollingerLine = 'top';
                break;
              }
              case '中線':{
                bollingerLine = 'middle';
                break;
              }
              case '下軌道':{
                bollingerLine = 'bottom';
                break;
              }
            }
            const isMeet = condition.op === 0 ? 
              prices[0].closingPrice <= bollingerBands[0][bollingerLine] : 
              prices[0].closingPrice >= bollingerBands[0][bollingerLine]
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: '',
                note: `${condition.op === 0 ? '小於' : '大於'}${condition.val}`
              }];
            }
          });
          break;
        }
        case 'foreignInvestorCB':{
          let property = 'foreign_investors_cb_3';
          if(condition.tm === 3) property = 'foreign_investors_cb_3';
          else if(condition.tm === 5) property = 'foreign_investors_cb_5';
          let result = await database.query(`SELECT stock_no, ${property} FROM 
          ${process.env.DB_CHIP_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let isCB = item[property] || 0;
            if(isCB){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: '',
              }];
            }
          })
          break;
        }
        case 'investmentTrustCB':{
          let property = 'investment_trust_cb_3';
          if(condition.tm === 3) property = 'investment_trust_cb_3';
          else if(condition.tm === 5) property = 'investment_trust_cb_5';
          let result = await database.query(`SELECT stock_no, ${property} FROM 
          ${process.env.DB_CHIP_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let isCB = item[property] || 0;
            if(isCB){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: '',
              }];
            }
          })
          break;
        }
        case 'dealerCB':{          
          let property = 'dealer_cb_3';
          if(condition.tm === 3) property = 'dealer_cb_3';
          else if(condition.tm === 5) property = 'dealer_cb_5';
          let result = await database.query(`SELECT stock_no, ${property} FROM 
          ${process.env.DB_CHIP_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let isCB = item[property] || 0;
            if(isCB){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: '',
              }];
            }
          })
          break;
        }
        case 'foreignInvestorBS':{
          let result = await database.query(`SELECT stock_no, chips FROM 
          ${process.env.DB_CHIP_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let chips = JSON.parse(item.chips);
            if(chips.length < condition.tm) return;
            let chipTotal = 0;
            for(let i = 0; i < condition.tm; i++){
              chipTotal += chips[i].foreignInvestorsBS;
            }
            let isMeet = condition.op === 0 ? chipTotal < condition.val : chipTotal > condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: parseInt(chipTotal),
              }];
            }
          })
          break;
        }
        case 'investmentTrustBS':{
          let result = await database.query(`SELECT stock_no, chips FROM 
          ${process.env.DB_CHIP_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let chips = JSON.parse(item.chips);
            if(chips.length < condition.tm) return;
            let chipTotal = 0;
            for(let i = 0; i < condition.tm; i++){
              chipTotal += chips[i].investmentTrustBS;
            }
            let isMeet = condition.op === 0 ? chipTotal < condition.val : chipTotal > condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: parseInt(chipTotal),
              }];
            }
          })
          break;
        }
        case 'dealerBS':{
          let result = await database.query(`SELECT stock_no, chips FROM 
          ${process.env.DB_CHIP_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let chips = JSON.parse(item.chips);
            if(chips.length < condition.tm) return;
            let chipTotal = 0;
            for(let i = 0; i < condition.tm; i++){
              chipTotal += chips[i].dealerBS;
            }
            let isMeet = condition.op === 0 ? chipTotal < condition.val : chipTotal > condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: parseInt(chipTotal),
              }];
            }
          })
          break;
        }
        case 'monthlyRevenueYoY':{
          let result = await database.query(`SELECT stock_no, monthly_revenues FROM 
          ${process.env.DB_FUNDAMENT_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let monthlyRevenues = JSON.parse(item.monthly_revenues);
            if(monthlyRevenues.length < condition.tm) return;
            for(let i = 0; i < condition.tm; i++){
              let isMeet = condition.op === 0 ? monthlyRevenues[i].YoY <= condition.val : monthlyRevenues[i].YoY >= condition.val;
              if(!isMeet) return;
            }
            screenedStocks[item.stock_no] = [{
              type: condition.type,
              tm: condition.tm,
              val: '',
              note: `${condition.op === 1 ? '大於' : '小於'} ${condition.val} %`,
            }];
          })
          break;
        }
        case 'monthlyRevenueMoM':{
          let result = await database.query(`SELECT stock_no, monthly_revenues FROM 
          ${process.env.DB_FUNDAMENT_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let monthlyRevenues = JSON.parse(item.monthly_revenues);
            if(monthlyRevenues.length < condition.tm) return;
            for(let i = 0; i < condition.tm; i++){
              let isMeet = condition.op === 0 ? monthlyRevenues[i].MoM <= condition.val : monthlyRevenues[i].MoM >= condition.val;
              if(!isMeet) return;
            }
            screenedStocks[item.stock_no] = [{
              type: condition.type,
              tm: condition.tm,
              val: '',
              note: `${condition.op === 0 ? '大於' : '小於'} ${condition.val} %`,
            }];
          })
          break;
        }
        case 'threeRatio':{
          let result = await database.query(`SELECT stock_no, incomes FROM 
          ${process.env.DB_FUNDAMENT_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let stockIncome = JSON.parse(item.incomes);
            if(stockIncome.length < condition.tm + 4) return;
            for(let i = 0; i < condition.tm; i++){
              if(stockIncome[i].grossProfitRatio < stockIncome[i + 4].grossProfitRatio || 
                stockIncome[i].operatingIncomeRatio < stockIncome[i + 4].operatingIncomeRatio || 
                stockIncome[i].netIncomeBeforeTaxRatio < stockIncome[i + 4].netIncomeBeforeTaxRatio) return;
            }
            screenedStocks[item.stock_no] = [{
              type: condition.type,
              tm: condition.tm,
              val: '',
            }];
          })
          break;
        }
        case 'epsGrowthRatio':{
          let result = await database.query(`SELECT stock_no, EPSes FROM 
          ${process.env.DB_FUNDAMENT_TABLE} WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            let stockEpses = JSON.parse(item.EPSes);
            if(stockEpses.length < condition.tm + 4) return;
            let latestEpsTotal = 0;
            let oldEpsTotal = 0;
            for(let i = 0; i < condition.tm; i++){
              latestEpsTotal += stockEpses[i].EPS;
              oldEpsTotal += stockEpses[i + 4].EPS;
            }
            if(oldEpsTotal <= 0){
              return;
            }
            let growthRatio = Math.floor((latestEpsTotal / oldEpsTotal - 1) * 10000) / 100;
            let isMeet = condition.op === 0 ? growthRatio <= condition.val : growthRatio >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: growthRatio,
              }];
            }
          })
          break;
        }
        case 'dividendYield': {
          let result = await database.query(`SELECT stock_no, dividend_yield FROM 
            ${process.env.DB_FUNDAMENT_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const dividendYield = item.dividend_yield;
            const isMeet = condition.op === 0 ? dividendYield <= condition.val : dividendYield >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: dividendYield,
              }];
            }
          });
          break;
        }
        case 'PER': {
          let result = await database.query(`SELECT stock_no, PER FROM 
            ${process.env.DB_FUNDAMENT_TABLE} 
            WHERE IF(${stockNo !== ''}, stock_no="${stockNo}", true)`);
          result.forEach(item => {
            const PER = item.PER;
            const isMeet = condition.op === 0 ? PER <= condition.val : PER >= condition.val;
            if(isMeet){
              screenedStocks[item.stock_no] = [{
                type: condition.type,
                tm: condition.tm,
                val: PER,
              }];
            }
          });
          break;
        }
      }
      resolve(screenedStocks);
    }
    catch(err){
      reject(err);
    }
    database.end();
  })
}