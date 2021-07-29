// This widdleware must be behind the express-session middleware
module.exports = function auth(req, res, next){
  if(!req.session.uuid){
    req.session.destroy();
    res.status(422).send({success: false, message: "驗證無效"});
  }
  else{
    next();
  }
}