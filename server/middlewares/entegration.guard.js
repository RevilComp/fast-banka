module.exports = (req, res, next, isEnabled) => {
   if(isEnabled){
       next();
   }
    else{
         res.status(403).send("Forbidden");
    }
}