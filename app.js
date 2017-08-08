var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

//=================================================
// Bot Setup
//=================================================

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('listening to %s', server.url); 
});

var connector = new builder.ChatConnector({
    appId: 'c88f8061-78f6-48ca-9e0c-9e6f44f29df5',
    appPassword: 'ewNcVq8THf2zopYvBg6FDdm'
});
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

//=================================================
// Bot Dialogs
//=================================================

bot.dialog('/', function (session, args) {
   if (!session.userData.greeting) {
       session.send("Hello. What is your name ?");
       session.userData.greeting = true;
   } else if (!session.userData.name) {
       getName(session);
   } else if (!session.userData.email) {
       getEmail(session);
   } else if (!session.userData.password) {
       getPassword(session);
   } else {
        session.userData = null;
    }

    session.endDialog();
});

function getName(session) {
    name = session.message.text;
    session.userData.name = name;
    session.send("Hello, " + name + ". What is your Email Address ?" )
}

function getEmail(session) {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    email = session.message.text;
    if (regex.test(email)) {
        session.userData.email = email;
        session.send("Thank you, " + session.userData.name + ". Please set a new password.")
    } else {
        session.send("Please type a valid email address. Like test@hotmail.com")
    }
}

function getPassword(session) {
    var regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    password = session.message.text;
    if (regex.test(password)) {
        session.userData.password = password;
        var data = session.userData;
        sendData(data, function (msg) {
           session.send(msg);
           session.userData = null; 
        });
    }
    else {
        session.send("Password must contain at least 8 characters, including at least 1 number, 1 uppercase letter, 1 lowercase letter and 1 special character. For example: testpass@123");
    }
}

function sendData(data, cb) {
    http.get("http://local.dev/github/aplostestbot/saveData.php?name=" + data.name + "&email=" + data.email + "&password=" + data.password, function (res) {
       var msg = '';
       res.on("data", function (chunk) {
           msg += chunk;
       });

       res.on('end', function () {
           cb(msg);
       }) 
    }).on('error', function (e) {
       console.log("Error: " + e.message); 
    });
}