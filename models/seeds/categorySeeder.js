if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Category = require('../category')
const db = require('../../config/mongoose')

db.once('open', () => {
  Promise.all(Array.from(    //在發出請求以後，會確保回應之後，才繼續進入到下一段
    { length: 3},
    (_, i) => Category.create({
      name:`家居物業-${i}`,
      categoryIcon: "fa-solid fa-house"
    })
  ))
    .then(() => {
      console.log('records were created..')
      process.exit()
    })
})