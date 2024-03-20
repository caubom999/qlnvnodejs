var express = require('express');
var router = express.Router('users');
var dbConnect = require("../database/connect");
var formidable = require('formidable');
/* GET users listing. */
router.get("/", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("login", { data: data });
  });
});
module.exports = router;
