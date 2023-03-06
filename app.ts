import { Sender } from './utils/types'
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
var indexRouter = require('./routes/index')

// var usersRouter = require('./routes/users');

interface Message {
  sender: Sender
  text: String
}

declare module 'express-session' {
  interface Session {
    states: {
      messages: Message[]
    }
  }
}

var app = express()
app.use(express.json())
// view engine setup
app.use(logger('dev'))
app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
)
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: (arg0: any) => void) {
  next(createError(404))
})

// error handler
app.use(function (
  err: { message: any; status: any },
  req: { app: { get: (arg0: string) => string } },
  res: {
    locals: { message: any; error: any }
    status: (arg0: any) => void
    render: (arg0: string) => void
  },
) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
