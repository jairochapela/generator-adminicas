require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
const nunjucks = require('nunjucks');
const moment = require('moment');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var {DataTypes} = require('sequelize');
var sequelize = require(path.join(__dirname, 'models', '_db'));
<% for (const t in models) { %>
var $<%= t %> = require(path.join(__dirname, 'models', '<%= t %>'))(sequelize, DataTypes);
<% } %>

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

var nunjucksEnv = nunjucks.configure('views', {
  express: app,
  autoescape: true
});

// customize nunjucks
nunjucksEnv.addFilter('smart', function(obj) {
  if (!obj || !obj.dataValues) return "";
  for (const key in obj.dataValues) {
    if (obj.dataValues.hasOwnProperty(key)) {
      const value = obj.dataValues[key];
      if (value && typeof value == 'string') return value;      
    }
  }
  return "";
});


nunjucksEnv.addFilter('dateformat', function(date, fmt) {
  return date? moment(date).format(fmt) : '';
});


app.set('view engine', 'html');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', async (req, res, next) => {
  res.render('_dashboard', {
    <% for (const t in models) { %>
      <%= t %>: await $<%= t %>.count(),
    <% } %>  
  })
})

<% for (const t in models) { %>
app.use('/<%= t %>', require(path.join(__dirname, 'routes', '<%= t %>')));  
<% } %>


// static assets
app.use(express.static('public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


app.listen(3000);
//module.exports = app;
