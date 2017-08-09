var restify = require('restify');
var builder = require('botbuilder');
var config = require('./bot-config.json');
var http = require('http');

//=================================================
// Bot Setup
//=================================================

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('listening to %s', server.url); 
});

var connector = new builder.ChatConnector({
    appId: config.AppCredentials.app_id,
    appPassword: config.AppCredentials.app_password
});

var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/25ca0874-22b3-4b42-b9f9-e6091ce8f0e2?subscription-key=0b8f0e68b07a45f9a45206492fb9f17d&verbose=true&timezoneOffset=0&spellCheck=false';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

//=================================================
// Bot Dialogs
//=================================================

var hourInDay = new Date().getHours();
var greetingTimeMessage;
var goodbyeTime;

if (hourInDay >= 0 && hourInDay < 12) {
		greetingTimeMessage = 'Good morning';
        goodbyeTime = 'morning';

	} else if (hourInDay >= 12 && hourInDay < 17) {
		greetingTimeMessage = 'Good afternoon';
        goodbyeTime = 'afternoon';

	} else if (hourInDay >= 17 && hourInDay < 24) {
		greetingTimeMessage = 'Good evening';
        goodbyeTime = 'evening';
	}
    
bot.dialog('/', intents);

intents.matches('How is Assistant', [
    function (session) {
        session.send('My name is Norma and I am Mr Tsilivis personal assistant.');
        if (!session.userData.name) {
            session.beginDialog('/profile');
        }
        else {
            session.send('How can I help you %s', session.userData.name);
            session.endDialog();
        }
    }
]);

intents.matches('Nicks Age', [
    function (session) {
        session.send('Mr Tsilivis is 29 years old. Anythin else ?');
    }
]);

intents.matches('Take a note', [
    function (session) {
        session.send('Thank you I will notify Nick');
    }
]);

intents.matches('Where is nick', [
    function (session) {
        session.send('I am sorry but Nick is not here. Thats all I can say :) ');
    }
]);

intents.matches('Send Boss CV', [
    function (session) {
        session.send('I can send you Mr Tsilivis info in your email.');
        // session.beginDialog('/email');
        if (!session.userData.email) {
            session.beginDialog('/email');
        }
        else {
            session.send('Done!! Sent it at: %s. Anything else ?', session.userData.email);
        }
    }
]);

intents.matches('Leaving', [
    function (session) {
        session.send('Thank you very much. Have a nice %s :D', goodbyeTime);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if(!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            session.send('Hi %s. How can I help you ?', session.userData.name);
        }
    }
]);

bot.dialog('/profile', [
    function (session) {
        // session.send('Hello, My name is Norma. Please give me your name.');
        builder.Prompts.text(session, 'Hello, My name is Norma. Please give me your name.');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Hi %s. How can I help you ?', session.userData.name);
        session.endDialog();
    }
]);

bot.dialog('/email', [
    function (session, args, next) {
        builder.Prompts.text(session, 'Can I have your email address please ?');
    },
    function (session, result) {
        session.send('Thak you %s, you will receive an email from me very soon.', session.userData.name);
        session.userData.email = result.response;
        // session.endDialog;
    }
]);

bot.dialog('reset', function (session, args, next) {
    session.userData.name = '';
    session.userData.email = '';
    session.send('Done!');
    session.endDialog();
})
.triggerAction({
    matches: /^reset$/i,
    confirmPrompt: "Are you sure?"
});