const mysql = require('mysql');

// creating connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'comp4537'
});
// connecting to MySQL to run DB query
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL database!");
    let sql = "INSERT INTO patient (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });
});