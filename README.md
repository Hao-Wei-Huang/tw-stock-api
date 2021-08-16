# TW Stock API

This is a web server providing RESTful API. This API includes member authentication, single stock information, stock query, etc. Make the website can get plenty and detailed stock data.

## Installation

Before installing, install Node.js and npm.

1. Download this project
    ```
    git clone https://github.com/Hao-Wei-Huang/tw-stock-api.git
    ```
2. Install the modules for the project
    ```
    cd tw-stock-api
    npm install
    ```
3. Setting environmental variables
    ```
    touch .env
    ```
    * Database account
      ```
      DB_HOST = { host }
      DB_PORT = { port }
      DB_USER = { user }
      DB_PASSWORD = { password }
      ```
    * Database table name
      ```
      DB_AUTH_TABLE = auth
      DB_COMPANY_TABLE = company
      DB_TECH_TABLE = technique
      DB_CHIP_TABLE = chip
      DB_FUNDAMENT_TABLE = fundament
      ```
    * Session secret key
      ```
      SESSION_SECRET = { secret key }
      ```
    * Email account ( optional )
      
      Use gmail to implement email notification, so need email account.
      If you don't need email notification, you can neglect it.
      ```
      EMAIL_ACCOUNT = { account }
      EMAIL_PASSWORD = { password }
      ```

## Features

* User authentication
* User information
* Stock screener
* Stock search
* Single stock information
* Single stock analysis
* Tracked stock list
* Screened stock condition list
* Email notification

## Technologies

* Node.js
* Express framework
* Backend router
* Database operation (CRUD)
* Session-based authentication
* Use express-validator to verify the accuracy of data and prevent from XSS.

## Documents

### Authentication
* sign up
  ```
  POST api/auth/signup
  ```
  
  Body Parameters

  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  email   | string | required | email account
  password | string | required | password
  name | string | required |  user name
  
  Response:
  ```json
  {
    "message": "註冊成功",
    "data": {
      "name": "user"
    }
  }
  ```
* login 
  ```
  POST api/auth/login
  ```
  
  Body Parameters

  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  email   | string | required | email account
  password | string | required | password
  
  Response:
  ```json
  {
    "message": "成功登入",
    "data": {
      "name": "user"
    }
  }  
  ```
* logout 
  ```
  POST api/auth/logout
  ```
  Response:
  ```json
  {
    "message": "成功登出"
  } 
  ```
  
* check authentication 
  ```
  POST api/auth/check
  ```
  Response:
  ```json
  {
    "message": "驗證有效",
    "data": {
        "name": "user"
    }
  }
  ```

### Single stock information
* Get single stock price 
  ```
  GET api/prices/{stock no}
  ```
  Query Parameters
  Parameter  | Status | Description
  ---  | --- | ---
  day   | required | day count

  Response:

  ```json
  {
    "data": {
      "stockNo": "2330",
      "stockName": "台積電",
      "data": [
        {
          "capacity": 26509,
          "openingPrice": 589,
          "highestPrice": 594,
          "lowestPrice": 587,
          "closingPrice": 591,
          "upDown": 6,
          "date": "20210722"
        }
      ]
    }
  }
  ```
* Get single stock chip
  ```
  GET api/chips/{stock no}
  ```
  Query Parameters
  Parameter  | Status | Description
  ---  | --- | ---
  day   | required | day count

  Response:

  ```json
  {
    "data": {
      "stockNo": "2330",
      "stockName": "台積電",
      "data": [
        {
          "foreignInvestorsBS": 11068,
          "investmentTrustBS": 39,
          "dealerBS": 739,
          "institutionalInvestorsBS": 11846,
          "date": "20210722"
        }
      ]
    }
  }
  ```
  
* Get single stock finance
  ```
  GET api/finances/{stock no}
  ```

  Response:

  ```json
  {
    "data": {
      "stockNo": "2330",
      "stockName": "台積電",
      "data": [
        {
          "monthlyRevenue": {
            "revenue": 148470660,
            "MoM": 32.13,
            "YoY": 22.82,
            "totalYoY": 18.22,
            "date": "202106"
          },
          "dividendYield": 1.69,
          "yearEPS": 20.85,
          "PER": 28.35,
          "PBR": 7.9
        }
      ]
    }
  }
  ```
  
* Get single stock analysis
  ```
  GET api/analyses/{stock no}
  ```

  Response:

  ```json
  {
    "data": {
      "stockNo": "2230",
      "score": 3,
      "data": [
        {
          "type": "ascendingOrder",
          "tm": "",
          "val": "",
          "remark": "均線呈多頭排列，走勢相當強勢。"
        },
        {
          "type": "monthlyRevenueYoY",
          "tm": 3,
          "val": "",
          "note": "大於 20 %",
          "remark": "月營收年增相當強勁，與去年營收相比屢屢創高。"
        }
      ]
    }
  }
  ```
* Get single stock company
  ```
  GET api/companies/{stock no}
  ```

  Response:

  ```json
  {
    "data": {
      "stockNo": "2330",
      "stockName": "台積電",
      "type": "上市",
      "industryCategory": "半導體業",
      "address": "新竹科學園區力行六路8號",
      "website": "Http://www.tsmc.com"
    }
  }
  ```

### Screen stocks
* screen stocks by conditions
  ```
  POST api/screener
  ```
  Body Parameters

  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  type   | string | required | condition type
  tm | number | required | time
  op | number | required | operator (0: <, 1: >)
  val| number | required | value
  
  Response:

  ```json
  {
    "data": [
      {
        "stockNo": "1101",
        "stockName": "台泥",
        "closingPrice": 52.1,
        "conditions": [
          {
              "type": "PER",
              "tm": "",
              "val": 12.46
          }
        ]
      }
    ]
  }
  ```
### Search stocks
* search related stocks by some key words
  ```
  GET api/search
  ```
  Query Parameters
  Parameter  | Status | Description
  ---  | --- | ---
  term  | required | the key word of the stock no or name 
  
  Response:
  
  ```json
  {
    "data": [
      {
        "stockNo": "1101",
        "stockName": "台泥"
      },
      {
        "stockNo": "1220",
        "stockName": "台榮"
      },
    ]
  }
  ```
### Tracked stocks 
* Get tracked stocks
  ```
  GET api/track/
  ```
  
  Response:
  
  ```json
  {
    "data": [
      {
        "stockNo": "2330",
        "stockName": "台積電",
        "closingPrice": 591,
        "upDown": 6,
        "capacity": 26509
      },
    ]
  }
  ```

* Add tracked stocks
  ```
  POST api/track/
  ```
  Body Parameters
  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  trackedStock   | number | required | tracked stock no

  Response:
  ```json
  {
    "data": 2330
  }
  ```
  
* Delete tracked stocks
  ```
  DELETE api/track/
  ```
  Body Parameters
  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  trackedStock   | number | required | tracked stock no

  Response:
  ```json
  {
    "data": 2330
  }
  ```
### Chose stock lists

* Get chose stock lists
  ```
  GET api/chose-stock-lists
  ```

  Response:
  ```json
  {
    "data": [
      {
        "id": "清單 1",
        "title": "asdf",
        "limit": 10,
        "conditions": [
            {
              "tm": "",
              "op": "",
              "val": "",
              "type": "ascendingOrder",
              "values": []
            }
        ]
      }
    ]
  }
  ```

* Add chose stock lists
  ```
  POST api/chose-stock-lists
  ```
  Body Parameters
  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  choseStockLists   | array | required | All lists information
  
  choseStockList Parameters
  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  id   | string | required | list id
  title   | string | required | list title
  limit   | number | required | condition count limit
  conditions   | array | required | screened conditions
  
  
  Response:
  ```json
  {
    "data": [
      {
        "id": "清單 1",
        "title": "清單 1",
        "limit": 10,
        "conditions": [
          {
            "tm": "",
            "op": "",
            "val": "",
            "type": "ascendingOrder",
            "values": []
          }
        ]
      },
    ]
  }
  ```
  
### User information

* Get user information
  ```
  GET api/users/user/info
  ```

  Response:
  ```json
  {
    "data": {
      "name": "uesr",
      "email": "******@gmail.com",
      "choseStockEmailNotification": "清單 1"
    }
  }
  ```
* Modify user information
  ```
  POST api/users/user/info
  ```
  Body Parameters
  Parameter | Type  | Status | Description
  ---  | --- | ---| ---
  name   | string | required | user name
  email   | string | required | email account
  choseStockEmailNotification   | string | required | email notification list id
    
  Response:
  ```json
  {
    "data": {
      "name": "uesr",
      "email": "******@gmail.com",
      "choseStockEmailNotification": "清單 1"
    }
  }
  ```

## Notes
The data source of the website is from [台灣證券交易所](https://www.twse.com.tw/zh/), [櫃檯買賣中心](https://www.tpex.org.tw/web/index.php?l=zh-tw) ,and [公開資訊觀測站](https://mops.twse.com.tw/mops/web/index).