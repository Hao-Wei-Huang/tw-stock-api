const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

class Email{
  constructor(){
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD,
      }
    });
  }
  send(mailOptions){
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, err => {
        if(err) return reject(err);
        resolve();
      });
    })
  }
}

module.exports = Email;