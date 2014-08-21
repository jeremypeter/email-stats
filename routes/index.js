var express = require('express');
var router = express.Router();
var emailData = require('../lib/cmAPI');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {title: 'Email Stats'});
});

/* GET highchart page*/
router.get('/highcharts', function(req, res){
  res.render('highchart');
})

router.get('/test', function(req, res){
	emailData('Genentech')
		.then(function(data){
			res.json(data);
		});
});

module.exports = router;
