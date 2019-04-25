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

var CONFIG = require('./config.json');

const sql = require('mssql')
/********** Requrire End **********/

/********** Connect DB Start **********/
async () => {
    try {
        await sql.connect('mssql://' + CONFIG.dbAcc + ':' + CONFIG.dbPwd + '@' + CONFIG.dbHost + '/' + CONFIG.dbName);
        const result = await sql.query`select * from mytable where id = ${value}`
        console.dir(result)
    } catch (err) {
        // ... error checks
    }
}
/********** Connect DB End **********/

/********** Website Start **********/
app.all('/', function (req, res) {
	// send this to client
	res.status(200).sendFile(path.join(__dirname + '/../public/index.html'));
});
module.exports = app;

// listen to port 3000
var server = app.listen(3000);
/********** Website End **********/