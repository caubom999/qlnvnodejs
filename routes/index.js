var express = require("express");
var router = express.Router();
var dbConnect = require("../database/connect");
var formidable = require('formidable');

/* GET login page. */
router.get("/", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("login", { data: data });
  });
});
//list dữ liệu nv page home
router.get("/home", function (req, res, next) {
  dbConnect.query("SELECT tblqlnv.*, tblleave.DayOffStart, tblleave.DayOffEnd, CASE WHEN tblleave.LeaveType = 1 THEN 'Nghỉ phép' WHEN tblleave.LeaveType = 2 THEN 'Nghỉ không lương' ELSE 'Loại không xác định' END AS LeaveType FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID", function (err, data) {
    if (err) throw err;
    res.render("home", { data: data });
  });
});

// router.get("/home", function (req, res, next) {
//   dbConnect.query("SELECT * FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID", function (err, data) {
//     if (err) throw err;
//     res.render("home", { data: data });
//   });
// });

//listnv
router.get("/listnv", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("listnv", { data: data });
  });
});
//leave
router.get("/leave", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("leave", { data: data });
  });
});
//report
router.get("/report", function (req, res, next) {
  dbConnect.query("SELECT tblqlnv.*, DATEDIFF(CURRENT_DATE, DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) + 1 - COALESCE(SUM(DATEDIFF(IFNULL(tblleave.DayOffEnd, CURRENT_DATE), tblleave.DayOffStart) + 1), 0) AS TotalWorkingDays, SUM(CASE WHEN tblleave.LeaveType = 1 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiPhep, SUM(CASE WHEN tblleave.LeaveType = 2 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiKhongLuong, 20 - COALESCE(SUM(CASE WHEN tblleave.LeaveType IN (1, 2) THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END), 0) AS RemainingLeaveDays FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID WHERE MONTH(tblleave.DayOffStart) = MONTH(CURRENT_DATE) OR tblleave.DayOffStart IS NULL GROUP BY tblqlnv.ID", function (err, data) {
    if (err) throw err;
    res.render("report", { data: data });
  });
});

//lấy ra tổng ngày công , ngày nghỉ phép và ngày nghỉ k lương
// router.get("/report", function (req, res, next) {
//   dbConnect.query("SELECT tblqlnv.*, DATEDIFF(CURRENT_DATE, DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) + 1 - COALESCE(SUM(DATEDIFF(IFNULL(tblleave.DayOffEnd, CURRENT_DATE), tblleave.DayOffStart) + 1), 0) AS TotalWorkingDays, SUM(CASE WHEN tblleave.LeaveType = 1 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiPhep, SUM(CASE WHEN tblleave.LeaveType = 2 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiKhongLuong FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID WHERE MONTH(tblleave.DayOffStart) = MONTH(CURRENT_DATE) OR tblleave.DayOffStart IS NULL GROUP BY tblqlnv.ID", function (err, data) {
//     if (err) throw err;
//     res.render("report", { data: data });
//   });
// });
//tính tổng số ngày nghỉ từ DayOffStart đến DayOffEnd
// router.get("/report", function (req, res, next) {
//   dbConnect.query("SELECT tblqlnv.*, SUM(DATEDIFF(IFNULL(tblleave.DayOffEnd, CURRENT_DATE), tblleave.DayOffStart) + 1) AS TotalWorkingDays FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID GROUP BY tblqlnv.ID", function (err, data) {
//     if (err) throw err;
//     res.render("report", { data: data });
//   });
// });

//Tổng số ngày làm việc tổng số ngày từ đầu tháng đến ngày hiện tại trừ đi tổng số ngày nghỉ nv
// router.get("/report", function (req, res, next) {
//   dbConnect.query("SELECT tblqlnv.*, DATEDIFF(CURRENT_DATE, DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) + 1 - COALESCE(SUM(DATEDIFF(IFNULL(tblleave.DayOffEnd, CURRENT_DATE), tblleave.DayOffStart) + 1), 0) AS TotalWorkingDays FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID WHERE MONTH(tblleave.DayOffStart) = MONTH(CURRENT_DATE) OR tblleave.DayOffStart IS NULL GROUP BY tblqlnv.ID", function (err, data) {
//     if (err) throw err;
//     res.render("report", { data: data });
//   });
// });




//register
router.get("/register", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("register", { data: data });
  });
});

//regiter sql
router.get("/register", function (req, res) {
  res.render("register");
});
router.post("/register", function (req, res) {
  dbConnect.query(
    `INSERT INTO account (name, age, address,email,password) values
    ('${req.body.name}','${req.body.age}','${req.body.address}','${req.body.email}','${req.body.password}')`,
    function (err) {
      if (err) throw err;
      res.redirect("/login")
    }
  )
})

//login sql
router.get("/login", function(req, res) {
  res.render("login");
});
router.post("/login", function(req, res) {
  const { email, password } = req.body;
  const bcrypt = require('bcryptjs');

  dbConnect.query(`SELECT * FROM account WHERE email = '${req.body.email}' AND password = '${req.body.password}'`, [email,password], function(err, results) {
    if (err) throw err;

    // Kiểm tra xem người dùng có tồn tại không
    if (results.length === 0) {
      return res.send('Invalid email or password?');
    }
    else
    res.redirect("/listnv");
    // So sánh mật khẩu đã hash
    // const user = results[0];
    // if (bcrypt.compareSync(password, user.password)) {
    //   req.session.user = user;
    //   res.redirect("/home");
    // } else {
    //   res.send('Invalid email or password');
    // }
  });
});

//add nhân viên 
router.get("/add", function (req, res) {
  res.render("add");
});
router.post("/add", function (req, res) {
  dbConnect.query(
    `INSERT INTO tblqlnv (ID ,FullName, Age, Address,Email,StartDate,ContractDocument)values
    ('${req.body.ID}','${req.body.FullName}','${req.body.Age}','${req.body.Address}','${req.body.Email}','${req.body.StartDate}','${req.body.ContractDocument}')`,
    function (err) {
      if (err) throw err;
      res.redirect("/listnv")
    }
  )
})
//Gửi thông tin nghỉ phép
router.get("/leave/:ID",function(req,res){
  var data = dbConnect.query(`select * from tblqlnv where ID=${req.params.ID}`,function(err, result){
    if(err) throw err;
    data = {
      ID:result[0].ID,
      FullName:result[0].FullName,
      Age:result[0].Age,
      Address:result[0].Address,
      Email:result[0].Email,
     
    }
    res.render("leave",{data});
  })
});
router.post("/leave", function(req, res) {
  // Insert dữ liệu vào bảng tblleave
  dbConnect.query(`INSERT INTO tblleave (EmployeeID, DayOffStart, DayOffEnd, LeaveType) VALUES (${req.body.ID}, '${req.body.DayOffStart}', '${req.body.DayOffEnd}', '${req.body.LeaveType}')`, function(err) {
    if (err) throw err;

    // Cập nhật dữ liệu trong bảng tblqlnv
    dbConnect.query(`UPDATE tblqlnv SET FullName='${req.body.FullName}', Age='${req.body.Age}', Address='${req.body.Address}', Email='${req.body.Email}' WHERE ID=${req.body.ID}`, function(err) {
      if (err) throw err;
      
      // Chuyển hướng về trang listnv
      res.redirect("/listnv");
    });
  });
});

//delete nhân viên
router.get("/delete/:ID",function(req,res){
  dbConnect.query(`delete from tblqlnv where ID=${req.params.ID}`,function(err){
    if(err) throw err;
    res.redirect("/listnv")
  })

})
//update nhân viên
router.get("/edit/:ID",function(req,res){
  var data = dbConnect.query(`select * from tblqlnv where ID=${req.params.ID}`,function(err, result){
    if(err) throw err;
    data = {
      ID:result[0].ID,
      FullName:result[0].FullName,
      Age:result[0].Age,
      Address:result[0].Address,
      Email:result[0].Email,
      StartDate:result[0].StartDate,
      ContractDocument:result[0].ContractDocument
    }
    res.render("edit",{data});
  })
});
router.post("/edit",function(req,res){
  dbConnect.query(`update tblqlnv set FullName='${req.body.FullName}',Age='${req.body.Age}',Address='${req.body.Address}',Email='${req.body.Email}',StartDate='${req.body.StartDate}',ContractDocument='${req.body.ContractDocument}' where ID=${req.body.ID} `,
  function(err){
    if(err) throw err;
    res.redirect("/listnv")
  })
})
//upload file

module.exports = router;
