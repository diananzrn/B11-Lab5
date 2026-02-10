const http = require('http');
const url = require('url');
const mysql = require('mysql');

// creating connection
const writeToDB = mysql.createConnection({
    host: 'url_of_mysql_server',
    user: 'root',
    password: 'admin_password',
    database: 'comp4537'
});

const readFromDB = mysql.createConnection({
    host: 'url_of_mysql_server',
    user: 'readonly_user',
    password: 'readonly_password',
    database: 'comp4537'
});

const PORT = 8888;

const server = http.createServer((req, res) => {
    const ReqUrl = url.parse(req.url, true);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight request   
    if(req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if(req.method === 'POST' && ReqUrl.pathname === '/insert') {

        let createTable = "CREATE TABLE IF NOT EXISTS patient (patientid INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), dateOfBirth DATETIME) ENGINE=InnoDB";
        let insertData = "INSERT INTO patient (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";

        writeToDB.query(createTable, function(err) {
            if (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: 'Error creating table: ' + err }));
            }
            writeToDB.query(insertData, function(err, result) {
                if (err) {
                    res.writeHead(500);
                    return res.end(JSON.stringify({ error: 'Error inserting data: ' + err }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Data inserted successfully', affectedRows: result.affectedRows }));
            });
        });

    } else if(req.method === 'GET' && ReqUrl.pathname.startsWith('/api/v1/sql/')) {

        const userQuery = decodeURIComponent(ReqUrl.pathname.replace('/api/v1/sql/', ''));
        userQuery = userQuery.replace(/^"|"$/g, '');

        readFromDB.query(userQuery, function(err, results) {
            if (err) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Error executing query: ' + err }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});