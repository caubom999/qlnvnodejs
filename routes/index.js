var express = require("express");
var router = express.Router();
var dbConnect = require("../database/connect");
/* GET home page. */
router.get("/", function (req, res, next) {
  dbConnect.query("SELECT * FROM student", function (err, data) {
    if (err) throw err;
    res.render("index", { data: data });
  });
});
//add
router.get("/add", function (req, res) {
  res.render("add");
});
router.post("/add", function (req, res) {
  dbConnect.query(
    `INSERT INTO student (id ,name, email, class)values('${req.body.id}','${req.body.name}','${req.body.email}','${req.body.class}')`,
    function (err) {
      if (err) throw err;
      res.redirect("/")
    }
  )
})
//delete
router.get("/delete/:id",function(req,res){
  dbConnect.query(`delete from student where id=${req.params.id}`,function(err){
    if(err) throw err;
    res.redirect("/")
  })

})
//update
router.get("/edit/:id",function(req,res){
  var data = dbConnect.query(`select * from student where id=${req.params.id}`,function(err, result){
    if(err) throw err;
    data = {
      id:result[0].id,
      name:result[0].name,
      email:result[0].email,
      class:result[0].class
    }
    res.render("edit",{data});
  })
});
router.post("/edit",function(req,res){
  dbConnect.query(`update student set name='${req.body.name}',email='${req.body.email}',class='${req.body.class}'`,
  function(err){
    if(err) throw err;
    res.redirect("/")
  })
})
module.exports = router;
