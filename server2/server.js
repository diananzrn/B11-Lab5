const http = require('http');
const url = require('url');
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const caCert = fs.readFileSync('ca-certificate.crt');

const writeConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: caCert }
};

const readConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_READ_USER,     
    password: process.env.DB_READ_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: caCert }
};

const writeToDB = mysql.createConnection(writeConfig);
const readFromDB = mysql.createConnection(readConfig);

const PORT = 8888;

const server = http.createServer((req, res) => {
    const ReqUrl = url.parse(req.url, true);

    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if(req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- POST Request (Uses Admin Connection) ---
    if(req.method === 'POST' && ReqUrl.pathname === '/insert') {
        const createTable = "CREATE TABLE IF NOT EXISTS patient (patientid INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), dateOfBirth DATETIME) ENGINE=InnoDB";
        const insertData = "INSERT INTO patient (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";

        // Check/Create Table first
        writeToDB.query(createTable, function(err) {
            if (err) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: 'DB Error: ' + err.message }));
            }
            // Then Insert
            writeToDB.query(insertData, function(err, result) {
                if (err) {
                    res.writeHead(500);
                    return res.end(JSON.stringify({ error: 'Insert Error: ' + err.message }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Data inserted', affectedRows: result.affectedRows }));
            });
        });

    } 
    // --- GET Request (Uses Read-Only Connection) ---
    else if(req.method === 'GET' && ReqUrl.pathname.startsWith('/api/v1/sql/')) {
        
        // Clean the query string from the URL
        const rawQuery = decodeURIComponent(ReqUrl.pathname.replace('/api/v1/sql/', ''));
        // Remove surrounding quotes if sent by the client
        const userQuery = rawQuery.replace(/^"|"$/g, '');

        console.log("Executing Read-Only Query:", userQuery);

        readFromDB.query(userQuery, function(err, results) {
            if (err) {
                res.writeHead(400); 
                return res.end(JSON.stringify({ error: 'Query Failed: ' + err.message }));
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