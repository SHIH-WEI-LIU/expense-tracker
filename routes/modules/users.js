const express = require('express')
const router = express.Router()
const User = require('../../models/Users')//引入建立好的 User model
const passport = require('passport')
const bcrypt = require('bcryptjs')  // 載入套件

//users登入路由
router.get('/login', (req, res) => {
  res.render('login')
})

//signIn
// 加入 middleware，驗證 request 登入狀態
router.post('/signIn', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))


//signUp
router.post('/signUp', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: '所有欄位都是必填。' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不符！' })
  }
  if (errors.length) {
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }
  User.findOne({ email }).then(user => {
    if (user) {
      errors.push({ message: '這個Email已註冊過。' })
      return res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt
      .genSalt(10) // 產生「鹽」，並設定複雜度係數為 10
      .then(salt => bcrypt.hash(password, salt)) // 為使用者密碼「加鹽」，產生雜湊值
      .then(hash => User.create({
        name,
        email,
        password: hash // 用雜湊值取代原本的使用者密碼
      }))
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
})


//logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你已經成功登出囉！')
  res.redirect('/users/login')
})

module.exports = router