const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LineStrategy = require('passport-line').Strategy
const User = require('../models/Users')
const bcrypt = require('bcryptjs')

module.exports = app => {
  // 初始化 Passport 模組
  app.use(passport.initialize())
  app.use(passport.session())

  // 設定本地(自己)登入策略
  passport.use(new LocalStrategy({ usernameField: 'email', passportField: 'password', passReqToCallback: true, }, (req, email, password, done) => {
    User.findOne({ email })
      //到資料庫找是否有相對應帳號
      .then(user => {
        //若找不到代表帳號尚未註冊
        if (!user) {
          return done(null, false, req.flash('warning_msg', '該帳號尚未註冊！'))
        }
        //若有找到帳號
        return bcrypt.compare(password, user.password).then(isMatch => {
          //若有找到帳號但密碼不正確
          if (!isMatch) {
            return done(null, false, req.flash('warning_msg', '帳號或密碼輸入錯誤！'))
          }
          //若有找到帳號密碼也正確則回傳使用者資料
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))



  //第三方登入後的密碼加鹽函式
  function addSalt(name, email, done) {
    User.findOne({ email })
      .then(user => {
        //若有找到原本帳號就直接回傳原本使用者資訊
        if (user) return done(null, user)
        //若沒找到代表還沒有該使用者的資訊，故須重新建立帳號跟加鹽密碼
        const randomPassword = Math.random().toString(36).slice(-8) //由於屬性 password 有設定必填，我們還是需要幫使用 Facebook 註冊的使用者製作密碼。因此這裡刻意設定一串亂碼
        bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => User.create({
            name,
            email,
            password: hash
          }))
          .then(user => done(null, user))
          .catch(err => done(err, false))
      })
  }

  //設定fb登入策略
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID, //你的應用程式編號
    clientSecret: process.env.FACEBOOK_SECRET, //你的應用程式密鑰
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  }, (accessToken, refreshToken, profile, done) => {
    const { name, email, } = profile._json
    addSalt(name, email, done)
  }))

  //google策略
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  }, (accessToken, refreshToken, profile, done) => {
    const { name, email, } = profile._json
    addSalt(name, email, done)
  }))

  //line策略
  passport.use(new LineStrategy({
    channelID: process.env.LINE_ID,
    channelSecret: process.env.LINE_SECRET,
    callbackURL: process.env.LINE_CALLBACK
  }, (accessToken, refreshToken, profile, done) => {
    const name = profile._json.displayName
    const email = profile._json.userId
    addSalt(name, email, done)
  }))

  // 設定序列化與反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}