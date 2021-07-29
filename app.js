const express = require('express');
require('dotenv').config();
const session = require('./middlewares/session');
const authMiddleware = require('./middlewares/auth');

let app = express();
// add static files
app.use(express.static(__dirname + 'public'));
// middlewares
app.use(express.json());
app.use(session);

// routers
const auth = require('./routes/auth');
const screener = require('./routes/screener');
const search = require('./routes/search');
const check = require('./routes/check');
const track = require('./routes/track');
const prices = require('./routes/prices');
const chips = require('./routes/chips');
const finances = require('./routes/finances');
const analyses = require('./routes/analyses');
const companies = require('./routes/companies');
const choseStockLists = require('./routes/chose-stock-lists');
const users = require('./routes/users');

app.use('/api/auth', auth);
app.use('/api/search', search);
app.use('/api/check', check);
app.use('/api/prices', prices);
app.use('/api/chips', chips);
app.use('/api/finances', finances);
app.use('/api/analyses', analyses);
app.use('/api/companies', companies);
app.use(authMiddleware);
app.use('/api/screener', screener);
app.use('/api/track', track);
app.use('/api/chose-stock-lists', choseStockLists);
app.use('/api/users', users);

// 404
app.use((req, res, next) => {
  // response.redirect('/');
  res.status(404).send('抱歉，查無此頁面');
})
// 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('伺服器錯誤');
})

// 監聽 port
app.listen(process.env.PORT || 8080);