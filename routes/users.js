var express = require('express');
var router = express.Router();

/* GET userslist. */
router.get('/userlist', function(req, res){
  var db = req.db;

  db.collection('userlist').find().toArray(function(err, item){
    res.json(item);
  });
});

module.exports = router;
