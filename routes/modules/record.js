const express = require('express')
const router = express.Router()
const Record = require('../../models/Record')

// routes setting
//create
router.get('/new', (req, res) => {
  return res.render('new')
})

router.post('/', (req, res) => {
  const userId = req.user._id
  return Record.create({ ...req.body, userId })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})


//編輯資料頁面的路由
router.get('/:id/edit', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id
  return Record.findOne({ _id, userId })
    .lean()
    .then((record) => res.render('edit', { record }))
    .catch(error => console.log(error))
})
//修改特定資料的路由
router.put('/:id', (req, res) => {
  const id = req.params.id
  const userId = req.user._id
  return Record.findOneAndUpdate({ id, userId, ...req.body }) //找到對應的資料後整個一起更新
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//刪除的路由
router.delete('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id
  return Record.findOneAndDelete({ _id, userId })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//chart
router.get('/chart', (req, res) => {
  return res.render('chart')
})


module.exports = router
