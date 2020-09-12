const path = require('path');
var {DataTypes} = require('sequelize');
var sequelize = require(path.join(path.dirname(__dirname), 'models', '_db'));
var $model = require(path.join(path.dirname(__dirname), 'models', '<%= modelName %>'))(sequelize, DataTypes);
<% for (let field in model) { %>
    <% if (model[field].foreignKey && model[field].foreignKey.target_table) { %>
    var $<%= model[field].foreignKey.target_table %> = require(path.join(path.dirname(__dirname), 'models', '<%= model[field].foreignKey.target_table %>'))(sequelize, DataTypes);
    <% } %>
<% } %>
var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    const items = await $model.findAll();
    res.render('<%= modelName %>_list', {items});
});

router.post('/', async function(req, res, next) {
    try {
        const item = await $model.create(req.body);
        res.redirect('/');
    } catch(err) {
        res.render('<%= modelName %>_detail', {
            <% for (let field in model) { %>
                <% if (model[field].foreignKey && model[field].foreignKey.target_table) { %>
                    <%= model[field].foreignKey.target_table %>: await $<%= model[field].foreignKey.target_table %>.findAll(),
                <% } %>
            <% } %>        
            item: req.body,
            error: err.message
        });
    }
});

router.get('/_new', async function(req, res, next) {
    res.render('<%= modelName %>_detail', {
        <% for (let field in model) { %>
            <% if (model[field].foreignKey && model[field].foreignKey.target_table) { %>
                <%= model[field].foreignKey.target_table %>: await $<%= model[field].foreignKey.target_table %>.findAll(),
            <% } %>
        <% } %>        
        item:{}
    });
});

router.get('/:id', async function(req, res, next) {
    const item = await $model.findByPk(req.params.id);
    res.render('<%= modelName %>_detail', {
        <% for (let field in model) { %>
            <% if (model[field].foreignKey && model[field].foreignKey.target_table) { %>
                <%= model[field].foreignKey.target_table %>: await $<%= model[field].foreignKey.target_table %>.findAll(),
            <% } %>
        <% } %>
        item
    });
});

router.post('/:id', async function(req, res, next) {
    try {
        let item = await $model.findByPk(req.params.id);
        await item.update(req.body);
        res.redirect('/');
    } catch(err) {
        res.render('<%= modelName %>_detail', {
            <% for (let field in model) { %>
                <% if (model[field].foreignKey && model[field].foreignKey.target_table) { %>
                    <%= model[field].foreignKey.target_table %>: await $<%= model[field].foreignKey.target_table %>.findAll(),
                <% } %>
            <% } %>        
            item: req.body,
            error: err.message
        });
    }
});

module.exports = router;
