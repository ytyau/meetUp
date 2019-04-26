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

const uuidv1 = require('uuid/v1');
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

            var query = "Select MemberID, Username, Password, Gender, DOB, AccCreatedAt from Member where Username = '" + username + "' And Password = '" + hashedPwd + "'";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.recordset.length > 0)
                res.send(result.recordset[0]);
            else
                res.status(400).send('The password is not correct or the account is not exist.');
        } catch (err) {
            console.log('Error occurred in signin');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** SignIn End **********/

/********** Create Event Start **********/
app.post('/CreateEvent', async function (req, res) {
    var memberId = req.body['memberId'];
    var eventDatetime = req.body['eventDatetime'];
    var repeatBy = req.body['repeatBy'];
    var location = req.body['location'];
    var minParticipant = req.body['minParticipant'];
    var maxParticipant = req.body['maxParticipant'];
    var course = req.body['course'];
    var level = req.body['level'];
    var title = req.body['title'];
    var content = req.body['content'];

    if (!memberId || !eventDatetime || !repeatBy || !location || !minParticipant || !maxParticipant || !course || !level || !title || ! content)
    {
		res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var eventId = uuidv1();
            var query = "INSERT INTO meetUpDB.dbo.Event (EventID, EventDatetime, RepeatBy, Location, MinParticipant, MaxParticipant, Course, Level, Title, Content) VALUES ('" + eventId + "', '" + eventDatetime + "', '" + repeatBy + "', '" + location + "', " + minParticipant + ", " + maxParticipant + ", '" + course + "', '" + level + "', '" + title + "', '" + content + "');";
            console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.rowsAffected > 0)
            {
                query = "INSERT INTO meetUpDB.dbo.JoinEvent (EventID, MemberID) VALUES ('" + eventId + "', '" + memberId  + "');";
                result = await sql.query(query);
                if (result.rowsAffected > 0)
                {
                    res.send("Success");
                }
                else
                {
                    // console.log(query);
                    res.status(500).send('Error occurred in join event');
                }
            }
            else
            {
                console.log('Error occurred in create event')
                console.log(query);
                res.status(500).send('Server error.');
            }
        }
        catch (err)
        {
            console.log('Error occurred in create event');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Create Event End **********/

/********** Get Event Start **********/
app.get('/GetEvent', async function (req, res)
{
    var top = req.query.top;
    var offset = req.query.offset;
    var isGetAll = req.query.isGetAll;
    var memberId = req.query.memberId;
    var eventId = req.query.eventId;
    
    if (!top || !offset)
    {
        res.status(400).send("Please specify top and offset");
    }

    if (!isGetAll && !memberId && !eventId)
    {
        res.status(400).send("Please specify one of these fields: isGetAll, memberId, eventId");
    }
    else
    {
        try
        {
            var query = "";
            if (isGetAll)
            {
               query = "Select Event.EventID, EventDatetime, RepeatBy, Location, MinParticipant, MaxParticipant, Level, Title, Content, IsClosed, PickedUpBy, EventCreatedAt, Course From Event Where IsClosed = 0 Order By EventCreatedAt DESC Offset " + offset + " Rows Fetch Next " + top  +" Rows Only";
            }
            else if (memberId)
            {
                query = "Select Event.EventID, EventDatetime, RepeatBy, Location, MinParticipant, MaxParticipant, Level, Title, Content, PickedUpBy, EventCreatedAt, Course, IsClosed, JoinID, IsQuit, JoinedAt From Event, JoinEvent Where MemberID = '" + memberId + "' And Event.EventID = JoinEvent.EventID And IsQuit = 0 Order By JoinEvent.JoinedAt DESC Offset " + offset + " Rows Fetch Next " + top + " Rows Only";
            }
            else
            {
                query = "Select * from Event Where EventID = '" + eventId +  "'";
            }
            var result = await sql.query(query);
            res.send(result.recordset);
        }
        catch (err)
        {
            console.log('Error occurred in GetEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Event End **********/

/********** Website Start **********/
app.all('/', function (req, res) {
    // send this to client
    res.status(200).sendFile(path.join(__dirname + '/../public/index.html'));
});
module.exports = app;

// listen to port 3000
var server = app.listen(3000);
/********** Website End **********/