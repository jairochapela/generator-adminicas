const path = require('path');
var {DataTypes} = require('sequelize');
var sequelize = require(path.join(path.dirname(__dirname), 'models', '_db'));
var $model = require(path.join(path.dirname(__dirname), 'models', '<%= modelName %>'))(sequelize, DataTypes);
var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    const items = await $model.findAll();
    res.render('<%= modelName %>_list', {items});
});


router.get('/:id', async function(req, res, next) {
    const item = await $model.findByPk(req.params.id);
    res.render('<%= modelName %>_detail', {item});
});


module.exports = router;
