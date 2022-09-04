// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()
// 引用 Restaurant model
const Record = require('../../models/Record')
const categoryIcon = {
  '居家物業': '<i class="categoryIcon fa-solid fa-house"></i>',
  '交通出行': '<i class="categoryIcon fa-solid fa-van-shuttle"></i>',
  '休閒娛樂': '<i class="categoryIcon fa-solid fa-face-grin-beam"></i>',
  '餐飲食品': '<i class="categoryIcon fa-solid fa-utensils"></i>',
  '其他': '<i class="categoryIcon fa-solid fa-pen"></i>'
}


//首頁路由
router.get('/', (req, res) => {
  const userId = req.user._id
  Record.find({ userId })
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .sort({ _id: 'asc' }) //依照建立順序來排列出來
    .then(record => {
      let totalAmount = 0
      record.forEach(record => {
        totalAmount += record.amount
      })
      res.render('index', { record, totalAmount, categoryIcon })
    })
    .catch(error => console.error(error)) // 錯誤處理
})
//分類種類
router.get('/:categoryName', (req, res) => {
  const userId = req.user._id
  const { categoryName } = req.params
  Record.find({ categoryName, userId })
    .lean()
    .then(record => {
      let totalAmount = 0
      record.forEach(record => {
        totalAmount += record.amount
      })
      res.render('index', { record, totalAmount, categoryIcon })
    })
    .catch(error => console.error(error))
})

// 匯出路由模組
module.exports = router