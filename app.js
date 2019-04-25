/********** Requrire Start **********/
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));

var path = require('path');
app.use(express.static(path.join(__dirname, './public')));

var crypto = require('crypto');

var CONFIG = require('./config.json');

const sql = require('mssql')
/********** Requrire End **********/

/********** Connect DB Start **********/
async function connectDB() {
    try {
        await sql.connect('mssql://' + CONFIG.dbAcc + ':' + CONFIG.dbPwd + '@' + CONFIG.dbHost + '/' + CONFIG.dbName + '?encrypt=true');
        const result = await sql.query('select * from Member');
        // console.dir(result);
    } catch (err) {
        console.log('Error occurred when connecting to db');
        console.dir(err);
    }
}
connectDB();
/********** Connect DB End **********/

/********** SignUp Start **********/
app.post('/SignUp', async function (req, res) {
    var username = req.body['username'];
    var pwd = req.body['pwd'];
    var isStudent = req.body['isStudent'];
    var gender = req.body['gender'];
    var dob = req.body['dob']

    if (!username || !pwd || !isStudent || !gender || !dob) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Select MemberID from Member where Username = '" + username + "'");
            // console.dir(result);
            if (result.recordset.length > 0) {
                res.status(400).send('This username is already existed. Please use another name.');
            } else {
                var shasum = crypto.createHash('sha1');
                shasum.update(pwd);
                var hashedPwd = shasum.digest('hex');
                var query = "INSERT INTO Member (Username, Password, IsStudent, Gender, DOB) VALUES ('" + username + "', '" + hashedPwd + "', " + isStudent + ", '" + gender + "', '" + dob + "');";
                // console.log(query);
                var result = await sql.query(query);
                if (result.rowsAffected > 0)
                    res.send('Success');
                else {
                    console.dir(result);
                    res.status(500).send('Unknown error occurred.');
                }
            }
        } catch (err) {
            console.log('Error occurred in registration');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** SignUp End **********/

/********** SignIn End **********/
app.post('/SignIn', async function (req, res) {
    var username = req.body['username'];
    var pwd = req.body['pwd'];

    if (!username || !pwd) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var shasum = crypto.createHash('sha1');
            shasum.update(pwd);
            var hashedPwd = shasum.digest('hex');

            var query = "Select MemberID from Member where Username = '" + username + "' And Password = '" + hashedPwd + "'";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.recordset.length > 0)
                res.send('Success');
            else
                res.status(400).send('The password is not correct or the account is not exist.');
        } catch (err) {
            console.log('Error occurred in registration');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** SignIn End **********/

/********** Create Event Start **********/
app.post('/createEvent', async function (req, res) {
    var memberId = req.body['memberId'];
    var eventDatetime = req.body['eventDatetime'];
    var repeatBy = req.body['repeatBy'];
    var location = req.body['location'];
    var vacancy = req.body['vacancy'];
    var maxParticipant = req.body['maxParticipant'];
    var level = req.body['level'];
    var title = req.body['title'];
    var content = req.body['content'];

    if (!memberId || !eventDatetime || !repeatBy || !location || !vacancy || !maxParticipant || !level || !title || !content) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var query = "";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.recordset.length > 0)
                res.send('Success');
            else
                res.status(400).send('The password is not correct or the account is not exist.');
        } catch (err) {
            console.log('Error occurred in registration');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Create Event End **********/

/********** Website Start **********/
app.all('/', function (req, res) {
    // send this to client
    res.status(200).sendFile(path.join(__dirname + '/../public/index.html'));
});
module.exports = app;

// listen to port 3000
var server = app.listen(3000);
/********** Website End **********/