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
//list dữ liệu nv page Approval
router.get("/Approval", function (req, res, next) {
  // Retrieve data from the database to populate the Approval interface
  dbConnect.query("SELECT tblqlnv.*, tblleave.LeaveID, tblleave.DayOffStart, tblleave.DayOffEnd, tblleave.ApprovalStatus, CASE WHEN tblleave.LeaveType = 1 THEN 'Nghỉ phép' WHEN tblleave.LeaveType = 2 THEN 'Nghỉ không lương' ELSE 'Loại không xác định' END AS LeaveType FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID", function (err, data) {
    if (err) throw err;
    // Render the Approval view and pass retrieved data
    res.render("Approval", { data: data });
  });
});

router.post('/update-approval-status', function(req, res, next) {
  const { leaveID, newStatus } = req.body;
  // Update the ApprovalStatus in the database based on LeaveID
  dbConnect.query("UPDATE tblleave SET ApprovalStatus = ? WHERE LeaveID = ?", [newStatus, leaveID], function(err, result) {
    if (err) {
      console.error("Error updating approval status:", err);
      res.status(500).send("Failed to update approval status");
      return;
    }
    // Redirect back to the Approval page after successful update
    res.redirect("/Approval"); 
  });
});



//listnv
router.get("/listnv", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("listnv", { data: data });
  });
});


//employee_report
router.get("/employee_report", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, user) {
    if (err) throw err;
    res.render("employee_report", { user: user });
  });
});



//report
// router.get("/report", function (req, res, next) {
//   dbConnect.query("SELECT tblqlnv.*, DATEDIFF(CURRENT_DATE, DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) + 1 - COALESCE(SUM(DATEDIFF(IFNULL(tblleave.DayOffEnd, CURRENT_DATE), tblleave.DayOffStart) + 1), 0) AS TotalWorkingDays, SUM(CASE WHEN tblleave.LeaveType = 1 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiPhep, SUM(CASE WHEN tblleave.LeaveType = 2 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiKhongLuong, 20 - COALESCE(SUM(CASE WHEN tblleave.LeaveType IN (1, 2) THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END), 0) AS RemainingLeaveDays FROM tblqlnv LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID WHERE MONTH(tblleave.DayOffStart) = MONTH(CURRENT_DATE) OR tblleave.DayOffStart IS NULL GROUP BY tblqlnv.ID", function (err, data) {
//     if (err) throw err;
//     res.render("report", { data: data });
//   });
// });

router.get("/report", function (req, res, next) {
  // Lấy ngày bắt đầu và kết thúc từ tham số truy vấn (nếu có)
  let start_date = req.query.start_date;
  let end_date = req.query.end_date;

  // Nếu không có ngày bắt đầu được chỉ định, mặc định là ngày đầu tiên của tháng trước
  if (!start_date) {
    const today = new Date();
    const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    start_date = lastMonthFirstDay.toISOString().split('T')[0]; // Lấy ngày dưới dạng 'YYYY-MM-DD'
  }

  // Nếu không có ngày kết thúc được chỉ định, mặc định là ngày cuối cùng của tháng hiện tại
  if (!end_date) {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end_date = lastDayOfMonth.toISOString().split('T')[0]; // Lấy ngày dưới dạng 'YYYY-MM-DD'
  } else if (new Date(end_date) > new Date()) {
    // Nếu ngày kết thúc lớn hơn ngày hiện tại, chỉ định ngày kết thúc là ngày hiện tại
    end_date = new Date().toISOString().split('T')[0];
  }

  // Xây dựng câu truy vấn SQL với ngày bắt đầu và kết thúc được cung cấp
  let query = "SELECT tblqlnv.*, ";
  if (new Date(end_date) > new Date()) {
    query += "DATEDIFF(CURDATE(), DATE_FORMAT('" + start_date + "', '%Y-%m-01')) + 1 AS TotalWorkingDays, ";
  } else {
    query += "DATEDIFF('" + end_date + "', DATE_FORMAT('" + start_date + "', '%Y-%m-01')) + 1 AS TotalWorkingDays, ";
  }
  query += "SUM(CASE WHEN tblleave.LeaveType = 1 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiPhep, ";
  query += "SUM(CASE WHEN tblleave.LeaveType = 2 THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiKhongLuong, ";
  query += "20 - COALESCE(SUM(CASE WHEN tblleave.LeaveType IN (1, 2) THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END), 0) AS RemainingLeaveDays ";
  query += "FROM tblqlnv ";
  query += "LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID ";
  query += "WHERE (MONTH(tblleave.DayOffStart) = MONTH('" + start_date + "') OR tblleave.DayOffStart IS NULL) ";
  query += "AND tblleave.ApprovalStatus = 'approved' "; // Thêm điều kiện vào đây

  // Thêm điều kiện cho ngày bắt đầu và kết thúc nếu được cung cấp
  if (start_date && end_date) {
    if (new Date(end_date) > new Date()) {
      query += `AND tblleave.DayOffStart BETWEEN '${start_date}' AND '${new Date().toISOString().split('T')[0]}' `;
    } else {
      query += `AND tblleave.DayOffStart BETWEEN '${start_date}' AND '${end_date}' `;
    }
  }

  query += "GROUP BY tblqlnv.ID";

  // Thực thi câu truy vấn SQL
  dbConnect.query(query, function (err, data) {
    if (err) throw err;
    res.render("report", { data: data });
  });
});





//register
router.get("/register", function (req, res, next) {
  dbConnect.query("SELECT * FROM tblqlnv", function (err, data) {
    if (err) throw err;
    res.render("register", { data: data });
  });
});

//regiter sql

const bcrypt = require('bcrypt');

router.get("/register", function (req, res) {
  res.render("register");
});

router.post("/register", function (req, res) {
  const { FullName, Age, Address, Email, Password } = req.body;

  bcrypt.hash(Password, 10, function(err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).send("Error hashing password");
    } else {
      dbConnect.query(
        `INSERT INTO tblqlnv (FullName, Age, Address, Email, Password) VALUES (?, ?, ?, ?, ?)`,
        [FullName, Age, Address, Email, hash],
        function (err) {
          if (err) {
            console.error("Error inserting user:", err);
            res.status(500).send("Error inserting user");
          } else {
            res.redirect("/");
          }
        }
      );
    }
  });
});


//login sql
router.post("/login", function(req, res) {
  // const { Email, Password } = req.body;
  const Email = req.body.Email;
  const Password = req.body.Password;
  const bcrypt = require('bcryptjs');

  dbConnect.query(`SELECT * FROM tblqlnv WHERE Email = ?`, [Email], function(err, results) {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.length === 0) {
        return res.send('Invalid Email or Password');
      }

      const user = results[0];
      bcrypt.compare(Password, user.Password, function(err, result) {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).send("Internal Server Error");
        } else {
          if (result) {
            if (user.role === 'admin') {
              res.redirect("/listnv");
            } else {
              // Render trang employee_info và truyền thông tin của nhân viên đã đăng nhập
              res.render('employee_info', { user: user });
            }
          } else {
            res.send('Invalid Email or Password');
          }
        }
      });
    }
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

//employee_info
router.get("/employee_info/:ID", function (req, res, next) {
  
  const employeeID = req.params.ID; // Lấy ID của nhân viên từ URL

  dbConnect.query(`SELECT * FROM tblqlnv WHERE ID = ?`, [employeeID], function (err, user) {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (user.length === 0) {
      // Nếu không tìm thấy nhân viên với ID tương ứng, hiển thị lỗi
      return res.status(404).send("Employee not found");
    }

    // Nếu tìm thấy nhân viên, hiển thị thông tin của họ

    res.render("employee_info", { user: user[0] }); // Chỉ truyền thông tin của nhân viên đầu tiên trong mảng user
  });
});
//employee_report
router.get("/employee_report/:ID", function (req, res, next) {
  const employeeID = req.params.ID;
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  // Prepare the SQL query with placeholders for parameters
  const query = `
  SELECT 
    tblqlnv.*, 
    DATEDIFF(?, DATE_FORMAT(?, '%Y-%m-01')) + 1 - COALESCE(SUM(CASE WHEN tblleave.ApprovalStatus = 'approved' THEN DATEDIFF(IFNULL(tblleave.DayOffEnd, ?), tblleave.DayOffStart) + 1 ELSE 0 END), 0) AS TotalWorkingDays, 
    SUM(CASE WHEN tblleave.LeaveType = 1 AND tblleave.ApprovalStatus = 'approved' THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiPhep, 
    SUM(CASE WHEN tblleave.LeaveType = 2 AND tblleave.ApprovalStatus = 'approved' THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END) AS TotalNghiKhongLuong, 
    20 - COALESCE(SUM(CASE WHEN tblleave.LeaveType IN (1, 2) AND tblleave.ApprovalStatus = 'approved' THEN DATEDIFF(tblleave.DayOffEnd, tblleave.DayOffStart) + 1 ELSE 0 END), 0) AS RemainingLeaveDays 
  FROM 
    tblqlnv 
    LEFT JOIN tblleave ON tblqlnv.ID = tblleave.EmployeeID 
  WHERE 
    tblqlnv.ID = ? 
    AND ((tblleave.DayOffStart BETWEEN ? AND ?) OR tblleave.DayOffStart IS NULL)  
  GROUP BY 
    tblqlnv.ID`;

  // Execute the SQL query with parameters
  dbConnect.query(query, [end_date, start_date, end_date, employeeID, start_date, end_date], function (err, results) {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      return res.status(404).send("Employee not found");
    }

    // Render the employee report template with the first employee's data
    res.render("employee_report", { user: results[0] });
  });
});



//Gửi thông tin nghỉ phép
router.get("/leave/:ID",function(req,res){

  var user = dbConnect.query(`select * from tblqlnv where ID=${req.params.ID}`,function(err, result){
    if(err) throw err;
    user = {
      ID:result[0].ID, 
      FullName:result[0].FullName,
      Age:result[0].Age,
      Address:result[0].Address,
      Email:result[0].Email,

     
    }
    res.render("leave",{user});
  })
});
router.post("/employee_info/:ID", function(req, res) {
  const employeeID = req.params.ID;
  // Insert dữ liệu vào bảng tblleave
  dbConnect.query(`INSERT INTO tblleave (EmployeeID, DayOffStart, DayOffEnd, LeaveType) VALUES (${req.body.ID}, '${req.body.DayOffStart}', '${req.body.DayOffEnd}', '${req.body.LeaveType}')`, function(err,result) {
    if (err) throw err;

    // Cập nhật dữ liệu trong bảng tblqlnv
    dbConnect.query(`UPDATE tblqlnv SET Email='${req.body.Email}' WHERE ID=${req.body.ID}`, function(err,result) {
      if (err) throw err;
      // Chuyển hướng về trang listnv
      res.redirect("/employee_info/" + employeeID);
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
router.get("/employee_edit/:ID", function(req, res) {
  console.log('User')
  dbConnect.query(`SELECT * FROM tblqlnv WHERE ID=${req.params.ID}`, function(err, result) {
    if (err) throw err;
    const data = {
      ID: result[0].ID,
      FullName: result[0].FullName,
      Age: result[0].Age,
      Address: result[0].Address,
      Email: result[0].Email,
      StartDate: result[0].StartDate,
      ContractDocument: result[0].ContractDocument,
      role: result[0].role
    };
    res.render("employee_edit", { data });
  });
});

router.post("/employee_edit", function(req, res) {
  console.log('User')
  dbConnect.query(`UPDATE tblqlnv SET FullName='${req.body.FullName}', Age='${req.body.Age}', Address='${req.body.Address}', Email='${req.body.Email}', StartDate='${req.body.StartDate}', ContractDocument='${req.body.ContractDocument}' WHERE ID=${req.body.ID} `,
    function(err) {
      if (err) throw err;
      res.redirect(`/employee_info/${req.body.ID}`);
 
      });
    });



//update nhân viên
router.get("/edit/:ID", function(req, res) {
  dbConnect.query(`SELECT * FROM tblqlnv WHERE ID=${req.params.ID}`, function(err, result) {
    console.log('ADMIN')
    if (err) throw err;
    const data = {
      ID: result[0].ID,
      FullName: result[0].FullName,
      Age: result[0].Age,
      Address: result[0].Address,
      Email: result[0].Email,
      StartDate: result[0].StartDate,
      ContractDocument: result[0].ContractDocument,
      role: result[0].role
    };
    res.render("edit", { data });
  });
});

router.post("/edit", function(req, res) {
  console.log('ADMIN')
  dbConnect.query(`UPDATE tblqlnv SET FullName='${req.body.FullName}', Age='${req.body.Age}', Address='${req.body.Address}', Email='${req.body.Email}', StartDate='${req.body.StartDate}', ContractDocument='${req.body.ContractDocument}' WHERE ID=${req.body.ID} `,
    function(err) {
      if (err) throw err;
          res.redirect("/listnv");
      });
    });


//upload file

module.exports = router;
