const Database = require('./connections/database');
const Email = require('./notifications/email');
const screenStocks = require('./stock/screen-stocks');
const moment = require('moment');
require('dotenv').config();

const database = new Database();
const email = new Email();

choseStockEmailNotify();

async function choseStockEmailNotify(){
  try{
    let result = await database.query(`SELECT prices FROM ${process.env.DB_TECH_TABLE}`);
    if(JSON.parse(result[0].prices)[0].date !== moment().format('YYYYMMDD')) return database.end();
    result = await database.query(`SELECT email, name, chose_stock_lists, 
      chose_stock_email_notification FROM ${process.env.DB_AUTH_TABLE}`);
    for(let i = 0; i < result.length; i++){
      let user = result[i];
      if(!user.chose_stock_email_notification) continue;
      const choseStockLists = JSON.parse(user.chose_stock_lists);
      let targetList = choseStockLists.find(list => list.id === user.chose_stock_email_notification);
      let targetConditions = targetList.conditions;
      if(!targetConditions.length) continue;
      
      let filteredStocks1;
      let filteredStocks2;
      let intersectionStocks = {};
      let screenedStocks = [];

      filteredStocks1 = await screenStocks('', targetConditions[0]);
      for(let i = 1; i < targetConditions.length; i++){
        filteredStocks2 = await screenStocks('', targetConditions[i]);
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
        });
      }

      const mailOptions = {
        from: '"Easy Earn" <o0211ojack@gmail.com>', // sender address
        to: `${user.email}`, // list of receivers
        subject: "【今日股票篩選通知】", // Subject line
        html: `
        <div style="font-size: 16px">
          ${user.name}您好：<br><br>
          ${targetList.id} : ${targetList.title}<br>所篩選的股票：<br><br>
          <table style="font-size: 14px">
            <thead>
              <tr>
                <td width="80px">股票代號</td>
                <td width="120px">股票名稱</td>
                <td width="100px">收盤價</td>
              </tr>
            </thead>
            <tbody>
              ${screenedStocks.map(stock => `
                <tr>
                  <td>
                    ${stock.stockNo}
                  </td>
                  <td>
                    ${stock.stockName}
                  </td>
                  <td style="text-align: right;">
                    ${stock.closingPrice}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <br><br>
          <p>若有任何問題歡迎聯繫客服。</p>
        </div>
        `, // plain text body
      }
      email.send(mailOptions);
    }
  }
  catch(err){
    console.log(err);
  }
  database.end();
}

