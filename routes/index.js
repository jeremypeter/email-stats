var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {title: 'Email Stats'});
});

/* GET highchart page*/
router.get('/highcharts', function(req, res){
  res.render('highchart');
})

module.exports = router;
