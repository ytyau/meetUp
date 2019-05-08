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

var fs = require('fs');

const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
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

    if (!username || !pwd || !isStudent || !gender || !dob || !email) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Select MemberID from Member where Email = '" + email + "'");
            // console.dir(result);
            if (result.recordset.length > 0) {
                res.status(400).send('This email has been registered. Please use another email.');
            } else {
                var memberId = uuidv1();
                var shasum = crypto.createHash('sha1');
                shasum.update(pwd);
                var hashedPwd = shasum.digest('hex');
                var query = "INSERT INTO Member (MemberID, Username, Password, IsStudent, Gender, DOB, Email) VALUES ('" + memberId + "', '" + username + "', '" + hashedPwd + "', " + isStudent + ", '" + gender + "', '" + dob + "', '" + email + "');";
                // console.log(query);
                var result = await sql.query(query);
                if (result.rowsAffected > 0) {
                    res.send('Success');
                    SendVerificationMail(email, memberId, username);
                } else {
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

/********** Send Mail Start **********/
function SendVerificationMail(toMail, memberId, username) {
    var expireyTime = new Date();
    expireyTime.setDate(expireyTime.getDate() + 1); // Expired 1 day after
    fs.readFile('mailTemplate/MailVerification.html', 'utf8', function (err, htmlContent) {
        if (err) {
            console.dir(err);
        } else {
            htmlContent = htmlContent.replace("{{Username}}", username);
            htmlContent = htmlContent.replace("{{link}}", "http://localhost:3000/#/login?token=" + memberId);
            htmlContent = htmlContent.replace("{{ExpiryDatetime}}", dateFormat(expireyTime, "dd/mm/yyyy h:MMtt"));
            htmlContent = htmlContent.replace("{{CurrentDate}}", dateFormat("dd mmm, yyyy"));
            SendMail(toMail, 'Verify Your MeetUp Accont', htmlContent);
        }
    });
}
/********** Send Mail End **********/

/********** Mail Verification Start **********/
app.get('/MailVerification', async function (req, res) {
    var token = req.query.token;

    if (!token) {
        // Fail case
        res.status(400).send("Please specify all fields");
    } else {
        try {
            var result = await sql.query("Update Member Set IsVerified = 1 Where MemberID = '" + token + "'");
            if (result.rowsAffected > 0) {
                // Success case
                res.send("Success");
            } else {
                // Fail case
                res.status(400).send("Token is invalid");
            }
        } catch (err) {
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
            if (result.recordset.length > 0) {
                if (result.recordset[0].IsVerified) {
                    res.send(result.recordset[0]);
                } else {
                    res.status(400).send("Please first check your mailbox to activate the account.");
                }
            } else
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
    var availableTime = req.body['availableTime'];
    var duration = req.body['duration'];
    var repeatBy = req.body['repeatBy'];
    var location = req.body['location'];
    var minParticipant = req.body['minParticipant'];
    var maxParticipant = req.body['maxParticipant'];
    var course = req.body['course'];
    var level = req.body['level'];
    var title = req.body['title'];
    var content = req.body['content'];

    if (!memberId || !availableTime || !duration || !repeatBy || !location || !minParticipant || !maxParticipant || !course || !level || !title || !content) {
        console.dir(req);
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var eventId = uuidv1();
            var query = "INSERT INTO meetUpDB.dbo.Event (EventID, AvailableTime, Duration, RepeatBy, Location, MinParticipant, MaxParticipant, Course, Level, Title, Content) VALUES ('" + eventId + "', '" + availableTime + "', '" + duration + "', '" + repeatBy + "', '" + location + "', " + minParticipant + ", " + maxParticipant + ", '" + course + "', '" + level + "', '" + title + "', '" + content + "');";
            // console.log(query);
            var result = await sql.query(query);
            // console.dir(result);
            if (result.rowsAffected > 0) {
                // Join event here
                res.redirect('/JoinEvent?memberId=' + memberId + "&eventId=" + eventId + "&availableTime=" + availableTime);
            } else {
                console.log('Error occurred in create event')
                console.log(query);
                res.status(500).send('Server error.');
            }
        } catch (err) {
            console.log('Error occurred in create event');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Create Event End **********/

/********** Get Event Start **********/
app.get('/GetEvent', async function (req, res) {
    var top = req.query.top;
    var offset = req.query.offset;
    var isGetAll = req.query.isGetAll;
    var memberId = req.query.memberId;
    var eventId = req.query.eventId;

    if (!top || !offset) {
        res.status(400).send("Please specify top and offset");
    }

    if (!isGetAll && !memberId && !eventId) {
        res.status(400).send("Please specify one of these fields: isGetAll, memberId, eventId");
    } else {
        try {
            var selectItem = "";
            var fromTable = "";
            var condition = "";
            var orderBy = "";
            if (isGetAll) {
                selectItem = "*";
                fromTable = "Event";
                condition = "IsClosed = 0";
                orderBy = " Order By EventCreatedAt DESC Offset " + offset + " Rows Fetch Next " + top  +" Rows Only";
            }
            else if (memberId)
            {
                selectItem = "Event.EventID, Event.AvailableTime, RepeatBy, Location, MinParticipant, MaxParticipant, CurrentMemberCnt, Level, Title, Content, PickedUpBy, EventCreatedAt, Course, IsClosed, JoinID, IsQuit, JoinedAt";
                fromTable = "Event, JoinEvent";
                condition = "MemberID = '" + memberId + "' And Event.EventID = JoinEvent.EventID And IsQuit = 0";
                orderBy = " Order By JoinEvent.JoinedAt DESC Offset " + offset + " Rows Fetch Next " + top + " Rows Only";
            } else {
                selectItem = "*";
                fromTable = "Event";
                condition = "EventID = '" + eventId + "'";
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
        } catch (err) {
            console.log('Error occurred in GetEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Event Member Start **********/
app.get('/GetEventMember', async function (req, res)
{
    var eventId = req.query.eventId;
    
    if (!eventId)
    {
        res.status(400).send("Please specify all fields.");
    }
    else
    {
        try
        {
            var query = "Select MemberID, Username, Gender, FLOOR((CAST (GetDate() AS INTEGER) - CAST(DOB AS INTEGER)) / 365.25) AS Age From Member, JoinEvent Where EventID = '" + eventId + "' And Member.MemberID = JoinEvent.MemberID And IsQuit = 0";
            var result = await sql.query(query);
            res.send(result.recordset);
        }
        catch (err)
        {
            console.log('Error occurred in GetEventMember');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Event Member End **********/

/********** Get Event End **********/

/********** Search Event Start **********/
app.get('/SearchEvent', async function (req, res) {
    var top = req.query.top;
    var offset = req.query.offset;
    var course = req.query.course;
    var level = req.query.level;
    var repeatBy = req.query.repeatBy;

    if (!course || !level || !repeatBy) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
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
        } catch (err) {
            console.log('Error occurred in SearchEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Search Event End **********/

/********** Join Event Start **********/
app.get('/JoinEvent', async function (req, res) {
    var memberId = req.query.memberId;
    var eventId = req.query.eventId;
    var availableTime = req.query.availableTime;
    var isToSendNoti = req.query.isToSendNoti == "true";

    if (!memberId || !eventId || !availableTime) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Select AvailableTime, MaxParticipant, CurrentMemberCnt, IsClosed From Event Where EventID = '" + eventId + "'");
            if (result.recordset.length > 0) {
                if (result.recordset[0].CurrentMemberCnt < result.recordset[0].MaxParticipant && !result.recordset[0].IsClosed) {
                    var mutualTime = GetMutualAvailableTimeSlot(result.recordset[0].AvailableTime, availableTime);
                    if (Object.keys(mutualTime).length > 0)
                    {
                        query = "Update Event Set AvailableTime = '" + JSON.stringify(mutualTime) + "' Where EventID = '" + eventId + "'";
                        result = await sql.query(query);
                        if (result.rowsAffected > 0) {
                            query = "INSERT INTO meetUpDB.dbo.JoinEvent (EventID, MemberID, AvailableTime) VALUES ('" + eventId + "', '" + memberId + "', '" + availableTime + "');";
                            result = await sql.query(query);
                            if (result.rowsAffected > 0) {
                                res.send("Success");
                                if (isToSendNoti) {
                                    SendJoinEventNoti(memberId, eventId);
                                }
                            } else {
                                res.status(500).send("Fail to join event with eventId =" + eventId + ", memberId  = " + memberId);
                            }
                        } else {
                            res.status(500).send("Fail to update event AvailableTime with eventId =" + eventId + ", availableTime  = " + availableTime);
                        }
                    }
                    else
                    {
                        res.status(400).send("Fail to find mutual available time");
                    }
                } else {
                    res.status(400).send("Exceed max participants limit or the event is closed.");
                }
            } else {
                res.status(400).send("Cannot find a event with ID = " + eventId);
            }
        } catch (err) {
            console.log('Error occurred in JoinEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});

async function SendJoinEventNoti(memberId, eventId) {
    try {
        var lackParti = -99;
        var title = "";
        var message = "";
        var result = await sql.query("Select Username From Member Where MemberID = '" + memberId + "'");
        if (result.recordset.length > 0) {
            title = result.recordset[0].Username + " has joined the group ";
        }
        result = await sql.query("Select Title, MinParticipant, CurrentMemberCnt From Event Where EventID = '" + eventId + "'");
        if (result.recordset.length > 0) {
            title += '"' + result.recordset[0].Title + '"! ';
            lackParti = result.recordset[0].MinParticipant - result.recordset[0].CurrentMemberCnt;
            if (lackParti <= 0 && lackParti != -99) {
                message = "Enough people to start!";
            } else {
                message = lackParti + " more members to go!";
            }
        }
        result = await sql.query("Select Username, Email, Event.Title, JoinEvent.MemberID From JoinEvent, Member, Event Where Member.MemberID = JoinEvent.MemberID And JoinEvent.MemberID <> '" + memberId + "' And JoinEvent.EventID = '" + eventId + "' And IsQuit = 0");
        console.dir(result);
        for (i = 0; i < result.recordset.length; i++) {
            SendNoti(result.recordset[i].MemberID, title, message);
            if (lackParti == 0) {
                console.log('Start send enough member mail');
                SendEnoughGroupMemberMail(result.recordset[i].Username, result.recordset[i].Title, result.recordset[i].Email);
            }
        }
    } catch (err) {
        console.dir(err);
    }
}

async function SendEnoughGroupMemberMail(username, groupName, toMail) {
    fs.readFile('mailTemplate/EnoughGroupMember.html', 'utf8', function (err, htmlContent) {
        if (err) {
            console.dir(err);
        } else {
            htmlContent = htmlContent.replace("{{Username}}", username);
            htmlContent = htmlContent.replace("{{GroupName}}", groupName);
            htmlContent = htmlContent.replace("{{link}}", "http://localhost:3000/#/"); // TODO: change to the event page
            htmlContent = htmlContent.replace("{{CurrentDate}}", dateFormat("dd mmm, yyyy"));
            SendMail(toMail, 'Verify Your MeetUp Accont', htmlContent);
        }
    });
}
/********** Join Event End **********/

/********** Quit Event Stat **********/
app.post('/QuitEvent', async function (req, res) {
    var joinId = req.body['joinId'];
    var eventId = req.body['eventId'];

    if (!joinId || !eventId)
    {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Update JoinEvent Set IsQuit = 1 Where JoinID = '" + joinId + "'");
            if (result.rowsAffected > 0)
            {
                // Update event availableTime
                var query = "Select AvailableTime From JoinEvent Where EventID = '" + eventId + "' And IsQuit = 0";
                var mutualTimeslot = "";
                result = await sql.query(query);
                if (result.recordset.length > 0)
                {
                    mutualTimeslot = result.recordset[0].AvailableTime;
                    if (result.recordset.length > 1)
                    {
                        for (i = 1; i < result.recordset.length; i++)
                        {
                            mutualTimeslot = GetMutualAvailableTimeSlot(mutualTimeslot, result.recordset[i].AvailableTime)
                        }
                    }
                    if (typeof(mutualTimeslot) == "object")
                    {
                        mutualTimeslot = JSON.stringify(mutualTimeslot);
                    }
                    query = "Update Event Set AvailableTime = '" + mutualTimeslot + "' Where EventID = '" + eventId + "'";
                    result = await sql.query(query);
                    if (result.rowsAffected > 0)
                    {
                        res.send("Success");
                    }
                    else
                    {
                        res.status(500).send("Fail to update event AvailableTime for eventId = " + eventId);
                    }
                }
                else
                {
                    res.status(500).send("Fail to find the mutual available time for eventId = " + eventId);
                }
            }
            else
            {
                res.status(400).send("Fail to quit group for joinId = " + joinId);
            }
        } catch (err) {
            console.log('Error occurred in QuitEvent');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Quit Event End **********/

/********** Post Discussion Stat **********/
app.post('/PostDiscussion', async function (req, res) {
    var memberId = req.body['memberId'];
    var eventId = req.body['eventId'];
    var discussTitle = req.body['discussTitle'];
    var discussContent = req.body['discussContent'];

    if (!memberId || !eventId || !discussTitle || !discussContent) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Insert Into Discussion (EventID, MemberID, DiscussTitle, DiscussContent) Values ('" + eventId + "', '" + memberId + "', '" + discussTitle + "', '" + discussContent + "')");
            if (result.rowsAffected > 0) {
                res.send("Success");
            } else {
                res.status(400).send("Fail to post discussion for memberId = " + memberId + ", eventId = " + eventId + ", discussionTitle = " + discussTitle + ", discussionContent = " + discussContent);
            }
        } catch (err) {
            console.log('Error occurred in PostDiscussion');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Post Discussion End **********/

/********** Get Discussion Start **********/
app.get('/GetDiscussion', async function (req, res) {
    var eventId = req.query.eventId;

    if (!eventId) {
        res.status(400).send("Please specify eventId");
    } else {
        try {
            var result = await sql.query("Select Username, DiscussTitle, DiscussContent, DiscussionCreatedAt From Discussion, Member Where EventID = '" + eventId + "' And Member.MemberID = Discussion.MemberID");
            res.send(result.recordset);
        } catch (err) {
            console.log('Error occurred in GetDiscussion');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Discussion End **********/

/********** Get Notification Start **********/
app.get('/GetNotification', async function (req, res) {
    var memberId = req.query.memberId;

    if (!memberId) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Select * From Notification Where MemberID = '" + memberId + "'");
            res.send(result.recordset);
        } catch (err) {
            console.log('Error occurred in GetNotification');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Get Notification End **********/

/********** Read Notification Start **********/
app.get('/ReadNotification', async function (req, res) {
    var notificationId = req.query.notificationId;

    if (!notificationId) {
        res.status(400).send("Please specify all fields.");
    } else {
        try {
            var result = await sql.query("Update Notification Set isRead = 1 Where NotificationID = '" + notificationId + "'");
            if (result.rowsAffected > 0) {
                res.send("Success");
            } else {
                res.status(400).send("notificationId not valid.");
            }
        } catch (err) {
            console.log('Error occurred in ReadNotification');
            console.dir(err);
            res.status(500).send(err);
        }
    }
});
/********** Read Notification End **********/

/********** Send Notification Stat **********/
async function SendNoti(memberId, title, content) {
    try {
        var result = await sql.query("INSERT INTO Notification (MemberID, NotiTitle, NotiContent) Values ('" + memberId + "', '" + title + "', '" + content + "')");
        if (result.rowsAffected <= 0) {
            console.log("Inserted Notification but no rows affected");
        }
    } catch (err) {
        console.dir(err);
    }
}
/********** Send Notification End **********/

/********** Send Mail Start **********/
function SendMail(toMail, subject, content) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: CONFIG.fromGmail,
            pass: CONFIG.gmailPwd
        }
    });

    var mailOptions = {
        from: "MeetUp Team<" + CONFIG.fromGmail + ">",
        to: toMail,
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
    });
}
/********** Send Mail End **********/

/********** Generate Recommendation Start **********/
app.get('/GenerateRecommendation', async function (req, res) {
    try {
        var result = await sql.query("Select Sth Here"); // Check: if (result.recordset.length > 0)
        var result = await sql.query("INSERT INTO ..."); // Check: if (result.rowsAffected > 0)
    } catch (err) {
        console.log('Error occurred in API_NAME');
        console.dir(err);
        res.status(500).send(err);
    }
});
/********** Generate Recommendation End **********/

/********** Utility Start **********/
function GetMutualAvailableTimeSlot(availableTime1, availableTime2) {
    var mutualTime = {};
    if (typeof(availableTime1) == "string")
    {
        availableTime1 = JSON.parse(availableTime1);
    }
    if (typeof(availableTime2) == "string")
    {
        availableTime2 = JSON.parse(availableTime2);
    }

    if (availableTime1.mon && availableTime2.mon)
    {
        var tmp = GetMutualAvaiableHourMinute(availableTime1.mon, availableTime2.mon);
        if (tmp)
        {
            mutualTime.mon = tmp;
        }
    }
    if (availableTime1.tue && availableTime2.tue)
    {
        var tmp = GetMutualAvaiableHourMinute(availableTime1.tue, availableTime2.tue);
        if (tmp)
        {
            mutualTime.tue = tmp;
        }
    }
    if (availableTime1.wed && availableTime2.wed)
    {
        var tmp = GetMutualAvaiableHourMinute(availableTime1.wed, availableTime2.wed);
        if (tmp)
        {
            mutualTime.wed = tmp;
        }
    }
    if (availableTime1.thurs && availableTime2.thurs)
    {
        var tmp = GetMutualAvaiableHourMinute(availableTime1.thurs, availableTime2.thurs);
        if (tmp)
        {
            mutualTime.thurs = tmp;
        }
    }
    if (availableTime1.sat && availableTime2.sat)
    {
        var tmp = GetMutualAvaiableHourMinute(availableTime1.sat, availableTime2.sat);
        if (tmp)
        {
            mutualTime.sat = tmp;
        }
    }
    if (availableTime1.sun && availableTime2.sun)
    {
        var tmp = GetMutualAvaiableHourMinute(availableTime1.sun, availableTime2.sun);
        if (tmp)
        {
            mutualTime.sun = tmp;
        }
    }

    return mutualTime;
}

function GetMutualAvaiableHourMinute(time1, time2)
{
    var range1 = GetTimeRangeObjFromStr(time1);
    var range2 = GetTimeRangeObjFromStr(time2);

    if (range1 && range2)
    {
        start1 = moment('2019-01-01 ' + range1.from.hour + ":" + range1.from.minute);
        end1 = moment('2019-01-01 ' + range1.to.hour + ":" + range1.to.minute);
        start2 = moment('2019-01-01 ' + range2.from.hour + ":" + range2.from.minute);
        end2 = moment('2019-01-01 ' + range2.to.hour + ":" + range2.to.minute);

        var range1 = moment.range(start1, end1);
        var range2 = moment.range(start2, end2);
        var mutualRange = range1.intersect(range2);

        if (mutualRange)
        {
            // console.log(mutualRange.start.format("HH:mm"));
            // console.log(mutualRange.end.format("HH:mm"));
            return mutualRange.start.format("HH:mm") + " - " + mutualRange.end.format("HH:mm");
        }
        else
            return null;
    }
    else
        return null;
}

function GetTimeRangeObjFromStr(period)
{
    var matches = period.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
    if (matches.length === 5) {
        return {
            from: {
                hour: matches[1],
                minute: matches[2]
            },
            to: {
                hour: matches[3],
                minute: matches[4]
            }
        };
    }
    else
        return null;
}
/********** Utility End **********/

/********** Debug Start **********/
app.post('/Debug', async function (req, res)
{
    var j1 = req.body['j1'];
    var j2 = req.body['j2'];
    res.send(GetMutualAvailableTimeSlot(j1, j2));
});
/********** Debug End **********/

/********** Website Start **********/
app.all('/', function (req, res)
{
    // send this to client
    res.status(200).sendFile(path.join(__dirname + '/../public/index.html'));
});
module.exports = app;

// listen to port 3000
var server = app.listen(3000);
/********** Website End **********/