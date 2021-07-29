const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

let options = {
  host: process.env.DB_HOST,
	port: process.env.DB_PORT,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
	database: 'stock',
};

let sessionStore = new MySQLStore(options);

module.exports = session({
  secret: process.env.SESSION_SECRET,
  name: "session",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  rolling: true,
  cookie:{
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7*24*60*60*1000,
  }
})