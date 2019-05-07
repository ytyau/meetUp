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

var nodemailer = require('nodemailer');

var dateFormat = require('dateformat');
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
    var email = req.body['email']

    if (!username || !pwd || !isStudent || !gender || !dob || !email)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var result = await sql.query("Select MemberID from Member where Email = '" + email + "'");
            // console.dir(result);
            if (result.recordset.length > 0)
            {
                res.status(400).send('This email has been registered. Please use another email.');
            }
            else
            {
                var memberId = uuidv1();
                var shasum = crypto.createHash('sha1');
                shasum.update(pwd);
                var hashedPwd = shasum.digest('hex');
                var query = "INSERT INTO Member (MemberID, Username, Password, IsStudent, Gender, DOB, Email) VALUES ('" + memberId + "', '" + username + "', '" + hashedPwd + "', " + isStudent + ", '" + gender + "', '" + dob + "', '" + email + "');";
                // console.log(query);
                var result = await sql.query(query);
                if (result.rowsAffected > 0)
                {
                    res.send('Success');
                    SendVerificationMail(email, memberId, username);
                }
                else
                {
                    console.dir(result);
                    res.status(500).send('Unknown error occurred.');
                }
            }
        }
        catch (err)
        {
            console.log('Error occurred in registration');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** SignUp End **********/

/********** Send Mail Start **********/
function SendVerificationMail(toMail, memberId, username)
{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: CONFIG.fromGmail,
            pass: CONFIG.gmailPwd
        }
    });

    var expireyTime = new Date();
    expireyTime.setDate(expireyTime.getDate() + 1); // Expired 1 day after
    var htmlContent = '<!DOCTYPE html><html><body style="font-family: arial, sans-serif;"><h2>Welcome to MeetUp!</h2><p>Hi ' + username + '. Please click <a href="{{link}}" target="_blank">here</a> to verify your account. This link will expire at ' + dateFormat(expireyTime, "dd/mm/yyyy h:MMtt") + '.</p><p>MeetUp Team</p><p>' + dateFormat("dd mmm, yyyy") + '</p></body></html>';
    htmlContent = htmlContent.replace("{{link}}", "http://localhost:3000/MailVerification?token=" + memberId);

    var mailOptions = {
        from: "MeetUp Team<" + CONFIG.fromGmail + ">",
        to: toMail,
        subject: 'Verify Your MeetUp Accont',
        html: htmlContent
    };
      
    transporter.sendMail(mailOptions, function(error, info)
    {
        if (error)
        {
            console.log(error);
        }
    });
}
/********** Send Mail End **********/

/********** Mail Verification Start **********/
app.get('/MailVerification', async function (req, res)
{
    var token = req.query.token;
    
    if (!token)
    {
        // Fail case
        res.status(200).sendFile(path.join(__dirname + '/public/index.html'));
    }
    else
    {
        try
        {
            var result = await sql.query("Update Member Set IsVerified = 1 Where MemberID = '" + token + "'");
            if (result.rowsAffected > 0)
            {
                // Success case
                res.status(200).sendFile(path.join(__dirname + '/public/index.html'));
            }
            else
            {
                // Fail case
                res.status(200).sendFile(path.join(__dirname + '/public/index.html'));
            }
        }
        catch (err)
        {
            console.log('Error occurred in MailVerification');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Mail Verification End **********/

/********** SignIn End **********/
app.post('/SignIn', async function (req, res) {
    var email = req.body['email'];
    var pwd = req.body['pwd'];

    if (!email || !pwd) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var shasum = crypto.createHash('sha1');
            shasum.update(pwd);
            var hashedPwd = shasum.digest('hex');

            var query = "Select MemberID, Username, Gender, DOB, AccCreatedAt, Email, IsVerified from Member where Email = '" + email + "' And Password = '" + hashedPwd + "'";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.recordset.length > 0)
            {
                if (result.recordset[0].IsVerified)
                {
                    res.send(result.recordset[0]);
                }
                else
                {
                    res.status(400).send("Please first check your mailbox to activate the account.");
                }
            }
            else
                res.status(400).send('The password is not correct or the account is not exist.');
        }
        catch (err)
        {
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
    var availableTime = req.body['availableTime'];
    var repeatBy = req.body['repeatBy'];
    var location = req.body['location'];
    var minParticipant = req.body['minParticipant'];
    var maxParticipant = req.body['maxParticipant'];
    var course = req.body['course'];
    var level = req.body['level'];
    var title = req.body['title'];
    var content = req.body['content'];

    if (!memberId || !availableTime || !repeatBy || !location || !minParticipant || !maxParticipant || !course || !level || !title || !content)
    {
		res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var eventId = uuidv1();
            var query = "INSERT INTO meetUpDB.dbo.Event (EventID, AvailableTime, RepeatBy, Location, MinParticipant, MaxParticipant, Course, Level, Title, Content) VALUES ('" + eventId + "', '" + availableTime + "', '" + repeatBy + "', '" + location + "', " + minParticipant + ", " + maxParticipant + ", '" + course + "', '" + level + "', '" + title + "', '" + content + "');";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.rowsAffected > 0)
            {
                // Join event here
                res.redirect('/JoinEvent?memberId=' + memberId + "&eventId=" + eventId + "&availableTime=" + availableTime);
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
            var selectItem = "";
            var fromTable = "";
            var condition = "";
            var orderBy = "";
            if (isGetAll)
            {
                selectItem = "*";
                fromTable = "Event";
                condition = "IsClosed = 0";
                orderBy = " Order By EventCreatedAt DESC Offset " + offset + " Rows Fetch Next " + top  +" Rows Only";
            }
            else if (memberId)
            {
                selectItem = "Event.EventID, AvailableTime, RepeatBy, Location, MinParticipant, MaxParticipant, CurrentMemberCnt, Level, Title, Content, PickedUpBy, EventCreatedAt, Course, IsClosed, JoinID, IsQuit, JoinedAt";
                fromTable = "Event, JoinEvent";
                condition = "MemberID = '" + memberId + "' And Event.EventID = JoinEvent.EventID And IsQuit = 0";
                orderBy = " Order By JoinEvent.JoinedAt DESC Offset " + offset + " Rows Fetch Next " + top + " Rows Only";
            }
            else
            {
                selectItem = "*";
                fromTable = "Event";
                condition = "EventID = '" + eventId +  "'";
            }

            /********** Query Total Number of Record ***********/
            var query = "Select count(*) as TotalRecords From " + fromTable + " Where " + condition;
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            var totalRecords = result.recordset[0].TotalRecords;
            /********** Query Total Number of Record ***********/

            /********** Query Event ***********/
            query = "Select " + selectItem + " From " + fromTable + " Where " + condition + orderBy;
            result = await sql.query(query);
            /********** Query Event ***********/

            var returnObj = {};
            returnObj.totalRecords = totalRecords;
            returnObj.recordsets = result.recordsets;
            res.send(returnObj);
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

/********** Search Event Start **********/
app.get('/SearchEvent', async function (req, res)
{
    var top = req.query.top;
    var offset = req.query.offset;
    var course = req.query.course;
    var level = req.query.level;
    var repeatBy = req.query.repeatBy;
    
    if (!course || !level || !repeatBy)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            /********** Query Total Number of Record ***********/
            var query = "Select count(*) as TotalRecords From Event Where Course = '" + course + "' And Level = '" + level + "' And RepeatBy = '" + repeatBy + "'";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            var totalRecords = result.recordset[0].TotalRecords;
            /********** Query Total Number of Record ***********/

            /********** Query Event ***********/
            query = "Select * From Event Where Course = '" + course + "' And Level = '" + level + "' And RepeatBy = '" + repeatBy + "' Order By EventCreatedAt DESC Offset " + offset + " Rows Fetch Next " + top + " Rows Only";
            result = await sql.query(query);
            /********** Query Event ***********/

            var returnObj = {};
            returnObj.totalRecords = totalRecords;
            returnObj.recordsets = result.recordsets;
            res.send(returnObj);
        }
        catch (err)
        {
            console.log('Error occurred in SearchEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Search Event End **********/

/********** Join Event Start **********/
app.get('/JoinEvent', async function (req, res)
{
    var memberId = req.query.memberId;
    var eventId = req.query.eventId;
    var availableTime = req.query.availableTime;
    var isToSendNoti = req.query.isToSendNoti;
    
    if (!memberId || !eventId || !availableTime)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var result = await sql.query("Select MaxParticipant, CurrentMemberCnt, IsClosed From Event Where EventID = '" + eventId + "'"); // Check: if (result.recordset.length > 0)
            if (result.recordset.length > 0)
            {
                if (result.recordset[0].CurrentMemberCnt < result.recordset[0].MaxParticipant && !result.recordset[0].IsClosed)
                {
                    query = "Update Event Set AvailableTime = '" + availableTime + "' Where EventID = '" + eventId + "'";
                    result = await sql.query(query);
                    if (result.rowsAffected > 0)
                    {
                        query = "INSERT INTO meetUpDB.dbo.JoinEvent (EventID, MemberID) VALUES ('" + eventId + "', '" + memberId  + "');";
                        result = await sql.query(query);
                        if (result.rowsAffected > 0)
                        {
                            res.send("Success");
                            if (isToSendNoti)
                            {
                                SendJoinEventNoti(memberId, eventId);
                            }
                        }
                        else
                        {
                            res.status(500).send("Fail to join event with eventId =" + eventId + ", memberId  = " + memberId);
                        }
                    }
                    else
                    {
                        res.status(500).send("Fail to update event AvailableTime with eventId =" + eventId + ", availableTime  = " + availableTime );
                    }
                }
                else
                {
                    res.status(400).send("Exceed max participants limit.");
                }
            }
            else
            {
                res.status(400).send("Cannot find a event with ID = " + eventId);
            }
        }
        catch (err)
        {
            console.log('Error occurred in JoinEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});

async function SendJoinEventNoti(memberId, eventId)
{
    try
    {
        var lackParti = -99;
        var title = "";
        var message = "";
        var result = await sql.query("Select Username From Member Where MemberID = '" + memberId + "'");
        if (result.recordset.length > 0)
        {
            title = result.recordset[0].Username + " has joined the group ";
        }
        result = await sql.query("Select Title, MinParticipant, CurrentMemberCnt From Event Where EventID = '" + eventId + "'");
        if (result.recordset.length > 0)
        {
            title += '"' + result.recordset[0].Title + '"! ';
            lackParti = result.recordset[0].MinParticipant - result.recordset[0].CurrentMemberCnt;
            if (lackParti <= 0 && lackParti != -99)
            {
                message = "Enough people to start!";
            }
            else
            {
                message = lackParti + " more members to go!";
            }
        }
        result = await sql.query("Select MemberID From JoinEvent Where MemberID <> '" + memberId + "' And EventID = '" + eventId + "' And IsQuit = 0");
        for (i = 0; i < result.recordset.length; i++)
        {
            SendNoti(result.recordset[i].MemberID, title, message);
        }
    }
    catch (err)
    {
        console.dir(log);
    }
}
/********** Join Event End **********/

/********** Quit Event Stat **********/
app.post('/QuitEvent', async function (req, res)
{
    var joinId = req.body['joinId'];
    
    if (!joinId)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var result = await sql.query("Update JoinEvent Set IsQuit = 1 Where JoinID = '" + joinId + "'");
            if (result.rowsAffected > 0)
            {
                res.send("Success");
            }
            else
            {
                res.status(400).send("Fail to quit group for joinId = " + joinId);
            }
        }
        catch (err)
        {
            console.log('Error occurred in QuitEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Quit Event End **********/

/********** Post Discussion Stat **********/
app.post('/PostDiscussion', async function (req, res)
{
    var memberId = req.body['memberId'];
    var eventId = req.body['eventId'];
    var discussTitle = req.body['discussTitle'];
    var discussContent = req.body['discussContent'];
    
    if (!memberId || !eventId ||!discussTitle || !discussContent)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var result = await sql.query("Insert Into Discussion (EventID, MemberID, DiscussTitle, DiscussContent) Values ('" + eventId + "', '" + memberId + "', '" + discussTitle + "', '" + discussContent + "')");
            if (result.rowsAffected > 0)
            {
                res.send("Success");
            }
            else
            {
                res.status(400).send("Fail to post discussion for memberId = " + memberId + ", eventId = " + eventId + ", discussionTitle = " + discussTitle + ", discussionContent = " + discussContent);
            }
        }
        catch (err)
        {
            console.log('Error occurred in PostDiscussion');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Post Discussion End **********/

/********** Get Discussion Start **********/
app.get('/GetDiscussion', async function (req, res)
{
    var eventId = req.query.eventId;
    
    if (!eventId)
    {
        res.status(400).send("Please specify eventId");
    }
    else
    {
        try
        {
            var result = await sql.query("Select Username, DiscussTitle, DiscussContent, DiscussionCreatedAt From Discussion, Member Where EventID = '" + eventId + "' And Member.MemberID = Discussion.MemberID");
            res.send(result.recordset);
        }
        catch (err)
        {
            console.log('Error occurred in GetDiscussion');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Discussion End **********/

/********** Get Notification Start **********/
app.get('/GetNotification', async function (req, res)
{
    var memberId = req.query.memberId;
    
    if (!memberId)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var result = await sql.query("Select * From Notification Where MemberID = '" + memberId + "'");
            res.send(result.recordset);
        }
        catch (err)
        {
            console.log('Error occurred in GetNotification');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Notification End **********/

/********** Send Notification Stat **********/
async function SendNoti(memberId, title, content)
{
    try
    {
        var result = await sql.query("INSERT INTO Notification (MemberID, NotiTitle, NotiContent) Values ('" + memberId + "', '" + title + "', '" + content + "')");
        if (result.rowsAffected <= 0)
        {
            console.log("Inserted Notification but no rows affected");
        }
    }
    catch (err)
    {
        console.dir(err);
    }
}
/********** Send Notification End **********/

/********** Website Start **********/
app.all('/', function (req, res) {
    // send this to client
    res.status(200).sendFile(path.join(__dirname + '/../public/index.html'));
});
module.exports = app;

// listen to port 3000
var server = app.listen(3000);
/********** Website End **********/