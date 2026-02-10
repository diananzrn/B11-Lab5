const http = require('http');
const url = require('url');
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const caCert = fs.readFileSync('ca-certificate.crt');

const dbConfig = {
host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    ssl: {
        ca: caCert           
    }
};

const writeToDB = mysql.createConnection(dbConfig);
const readFromDB = mysql.createConnection(dbConfig);

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

        const createTable = "CREATE TABLE IF NOT EXISTS patient (patientid INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), dateOfBirth DATETIME) ENGINE=InnoDB";
        const insertData = "INSERT INTO patient (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";

        writeToDB.query(createTable, function(err) {
            if (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: 'Error creating table: ' + err.message }));
            }
            writeToDB.query(insertData, function(err, result) {
                if (err) {
                    res.writeHead(500);
                    return res.end(JSON.stringify({ error: 'Error inserting data: ' + err.message }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Data inserted successfully', affectedRows: result.affectedRows }));
            });
        });

    } 
    // GET: Run SQL Query
    else if(req.method === 'GET' && ReqUrl.pathname.startsWith('/api/v1/sql/')) {
        
        const userQuery = decodeURIComponent(ReqUrl.pathname.replace('/api/v1/sql/', '')).replace(/^"|"$/g, '');

        readFromDB.query(userQuery, function(err, results) {
            if (err) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Error executing query: ' + err.message }));
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