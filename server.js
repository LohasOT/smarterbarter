require('dotenv').config()

const express = require('express')
const { join } = require('path')

const passport = require('passport')
const { User, Item, Category, Note } = require('./models') 
//prevents being signed out on page load
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt')

const app = express()

app.use(express.static(join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
}, async function ({ id }, cb) {
  try {
    const user = await User.findOne({ where: { id }, include: [Item, Note] }) // add note??
    cb(null, user)
  } catch (err) {
    cb(err, null)
  }
}))


app.use(require('./routes'))

async function init() {
  await require('./db').sync()
  app.listen(process.env.PORT || 4000)
}

init()