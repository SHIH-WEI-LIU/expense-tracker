if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const bcrypt = require('bcryptjs')
const Record = require('../Record')
const User = require('../user')
const db = require('../../config/mongoose')
const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}
db.once('open', () => {
  bcrypt
    .genSalt(10)
    .then(salt => bcrypt.hash(SEED_USER.password, salt))
    .then(hash => User.create({
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: hash
    }))
    .then(user => {
      const userId = user._id
      return Promise.all(Array.from(    //在發出請求以後，會確保回應之後，才繼續進入到下一段
        { length: 5 },
        (_, i) => Record.create({ 
          name: '晚餐', 
          date: `2022-06-1${i}`, 
          amount: i + 10, 
          categoryName: '餐飲食品', 
          userId 
        })
      ))
    })
    .then(() => {
      console.log('records were created..')
      process.exit()
    })
})
