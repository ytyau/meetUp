/********** Requrire Start **********/
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: false
}));

var path = require('path');
app.use(express.static(path.join(__dirname, '/../public')));

var crypto = require('crypto');

var CONFIG = require('config.json');

const sql = require('mssql')
/********** Requrire End **********/

/********** Connect DB Start **********/
async () => {
    try {
        await sql.connect('mssql://username:password@localhost/database')
        const result = await sql.query`select * from mytable where id = ${value}`
        console.dir(result)
    } catch (err) {
        // ... error checks
    }
}
/********** Connect DB End **********/