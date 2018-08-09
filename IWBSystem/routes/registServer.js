'use strict';
const express = require("express");
const router = express.Router();
const pug = require("pug");
const analysis = require('../control/resultAnalysis');
const config = require("../config/config");
const db = require("../control/database");
const Product = require("../control/product");



/*Get Client Page*/
router.get("/", function (req, res) {
    res.render('regist', {
        title: 'データ登録',
        caption: '写真をアップロードしてください',
        host: config.WS_HOST + config.WS_PATH
    });
});

router.post("/", function (req, res) {
    //登録
    console.log(req);
    let data = req.body;
    let response = res;
    insertDatas(data, function (err, result) {
        if(err){
            response.status(403).send(err);   
        }else{
            response.send('OK');
        }
    });
});
//DB登録
function insertDatas(data, callback) {
    let name = analysis.convertContentsToWords(data.name).join(' ');
    let category = analysis.convertContentsToWords(data.category).join(' ');
    let content = analysis.convertContentsToWords( name + ' ' + category + ' ' + data.content).join(' ');
    let product = new Product(
        data.id,
        name,
        category,
        content,
        '',
        data.url
    );
    db.connect().then(client => {
        product.insert(client, function (err, res) {
            callback(err, res);
        });
    }).catch(err => {
        callback(err);
    });
}

module.exports = router;