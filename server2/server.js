// Dependencies
const http = require('http');
const url = require('url');
const mysql = require('mysql2');
const fs = require('fs');

require('dotenv').config();

const { writeConfig, readConfig } = require('./config_modules/configs.js');

// Configuration
const PORT = 8888;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// SQL Queries
const QUERIES = {
    CREATE_TABLE: `CREATE TABLE IF NOT EXISTS patient (
        patientid INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        dateOfBirth DATETIME
    ) ENGINE=InnoDB`,
    INSERT_DATA: `INSERT INTO patient (name, dateOfBirth) VALUES
        ('Sara Brown', '1901-01-01'),
        ('John Smith', '1941-01-01'),
        ('Jack Ma', '1961-01-30'),
        ('Elon Musk', '1999-01-01')`,
};

// Database Connections
const writeToDB = mysql.createConnection(writeConfig);
const readFromDB = mysql.createConnection(readConfig);


/**
 * Set CORS headers on response
 */
function setCorsHeaders(res) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
}

/**
 * Send JSON response with status code
 */
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/**
 * Handle POST /insert - Create table and insert sample data
 */
function handleInsertRequest(req, res) {
    writeToDB.query(QUERIES.CREATE_TABLE, (err) => {
        if (err) {
            return sendJsonResponse(res, 500, { error: `DB Error: ${err.message}` });
        }

        writeToDB.query(QUERIES.INSERT_DATA, (err, result) => {
            if (err) {
                return sendJsonResponse(res, 500, { error: `Insert Error: ${err.message}` });
            }

            sendJsonResponse(res, 200, {
                message: 'Data inserted',
                affectedRows: result.affectedRows,
            });
        });
    });
}

/**
 * Handle GET /api/v1/sql/ - Execute read-only query
 */
function handleQueryRequest(req, res, reqUrl) {
    const userQuery = reqUrl.query.q;

    if (!userQuery) {
        return sendJsonResponse(res, 400, { error: 'Missing SQL query parameter' });
    }

    const cleanQuery = userQuery.replace(/^"|"$/g, '');
    console.log('Executing Read-Only Query:', cleanQuery);

    readFromDB.query(cleanQuery, (err, results) => {
        if (err) {
            return sendJsonResponse(res, 400, { error: `Query Failed: ${err.message}` });
        }

        sendJsonResponse(res, 200, results);
    });
}

/**
 * Handle 404 Not Found
 */
function handleNotFound(res) {
    sendJsonResponse(res, 404, { error: 'Endpoint not found' });
}

// Server Setup
const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);

    // Set CORS headers
    setCorsHeaders(res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Route handlers
    if (req.method === 'POST' && reqUrl.pathname === '/insert') {
        handleInsertRequest(req, res);
    } else if (req.method === 'GET' && reqUrl.pathname === '/api/v1/sql/') {
        handleQueryRequest(req, res, reqUrl);
    } else {
        handleNotFound(res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});