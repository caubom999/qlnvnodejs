var mysql = require("mysql");
var conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'qlnv'
});
conn.connect();
module.exports=conn;