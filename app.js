var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const httpreq = require('request');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


const options = {
  hostname: process.env.END_POINT_HOST,
  path: process.env.END_POINT_PATH+'?pincode=505215&date=27-05-2021',
  headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36'},
  method: 'GET'
}
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.MESSENGER_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('-');
}

// Scheduler to check slots for every 1 minute
cron.schedule('* * * * *', () => {

// Date object initialized as per New Zealand timezone. Returns a datetime string
const nDate = new Date().toLocaleString('en-US', {timeZone: 'Asia/Calcutta'});
var jsonObj = [];
try {
  const date = formatDate(nDate);
  const url_knr = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=589&date='+date;
  const url_ped = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=601&date='+date;
  const url_man = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=594&date='+date;
  // load dishes fom external API
  httpreq.get(url_knr, (err, response, body) => {
    if (err) {
      console.error(error)
    }
    const resp = JSON.parse(body);
    resp.centers.forEach(function (center) {
      center.sessions.forEach(function (session) {
        if(session.available_capacity>0){
          var item = {};
          item.name = center.name;
          item.area = center.block_name;
          item.date = session.date;
          item.ageLimit = session.min_age_limit;
          item.vaccine = session.vaccine;
          item.type = center.fee_type;
          jsonObj.push(item);
        }
      });
    });
  });

  // load dishes fom external API
  httpreq.get(url_ped, (err, response, body) => {
    if (err) {
      console.error(error)
    }
    const resp = JSON.parse(body);
    resp.centers.forEach(function (center) {
      center.sessions.forEach(function (session) {
        if(session.available_capacity>0){
          var item = {};
          item.name = center.name;
          item.area = center.block_name;
          item.date = session.date;
          item.ageLimit = session.min_age_limit;
          item.vaccine = session.vaccine;
          item.type = center.fee_type;
          jsonObj.push(item);
        }
      
      });
    });
  });
  // load dishes fom external API
  httpreq.get(url_man, (err, response, body) => {
    if (err) {
      console.error(error)
    }
    const resp = JSON.parse(body);
    resp.centers.forEach(function (center) {

      center.sessions.forEach(function (session) {
        if(session.available_capacity>0){
          var item = {};
          item.name = center.name;
          item.area = center.block_name;
          item.date = session.date;
          item.age = session.min_age_limit;
          item.vaccine = session.vaccine;
          item.type = center.fee_type;
          item.available = session.available_capacity;
          jsonObj.push(item);
        }
      
      });
    });
    console.log(jsonObj.length);
    if(jsonObj.length>0){
      jsonObj.forEach(function (slot) {
        bot.sendMessage('1758209609', 'Center: '+slot.name+', Location: '+slot.area+', Date: '+slot.date+', Agelimit: '+slot.age+', Vaccine: '+slot.vaccine+', Type: '+slot.type+', Slots: '+slot.available); 
      });
    }
  });
  
} catch (err) {
  console.log(err);
}



});
// send a message to the chat acknowledging receipt of their message


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
