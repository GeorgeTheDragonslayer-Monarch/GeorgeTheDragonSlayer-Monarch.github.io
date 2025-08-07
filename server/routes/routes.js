const express = require('express');
const comicsController = require('./comicsController');

const router = express.Router();

router.post('/api/comics', comicsController.saveComic);
router.get('/api/comics', comicsController.getComics);

module.exports = router;