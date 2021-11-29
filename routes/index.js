var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dasan' });
});

router.get('/jabra', function(req, res, next) {
  res.render('jabra', { title: 'Jabra' });
});


module.exports = router;
