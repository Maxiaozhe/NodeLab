
var config = require("../config/config");
var db = require("../control/database");
var Product = require("../control/product");
var fs = require('fs');
var analysis = require('../control/resultAnalysis');

function testDatabase() {
    testInsert();
    try {
        db.query("select * from product_master", function (err, result) {
            console.log(result.rows);
        });
    } catch (ex) {
        console.log(ex);
    }

}

function testInsert() {
    let product = new Product(1,
        "ricoh mp c8003",
        "product office office supplies printer",
        "Ricoh Multi-function printer Photocopier Printer Managed Print Services Printing Laser printing",
        "(ricoh&mp&c8003)&Ricoh&printer&Multi-function&Photocopier",
        "https://www.ricoh.co.jp/mfp/mp_c/8003_6503/");
    db.connect().then(client => {
        product.insert(client);
    });

}

function insertDatas() {
    var buffer = fs.readFileSync('./test/test_datas.txt', { encoding: 'utf-8' });
    var datas = JSON.parse(buffer);
    //var datas = {
    //    "datas": [
    //        {
    //            "id": 2,
    //            "name": "ricoh interactive whiteboard d5520",
    //            "url": "https://www.ricoh.co.jp/iwb/d5520/",
    //            "result": "IMG-1533028336205.json"
    //        },
    //        {
    //            "id": 3,
    //            "name": "RICOH DD 5450/5440",
    //            "url": "http://www.ricoh.co.jp/opp/dd/5450_5440/",
    //            "result": "IMG-1533029311598.json"
    //        },
    //        {
    //            "id": 4,
    //            "name": "pentax 645d 645z",
    //            "url": "http://www.ricoh-imaging.co.jp/japan/products/645z-ir/",
    //            "result": "IMG-1533041251018.json"
    //        }
    //    ]
    //};
    db.connect().then(client => {
        for (data of datas.datas) {
            let count = 0;
            let rawData = fs.readFileSync(data.result, { encoding: 'utf-8' });
            let json = JSON.parse(rawData);
            let resData = analysis.filterResult(json);
            let product = new Product(
                data.id,
                data.name,
                analysis.getCategory(resData),
                analysis.getQueryWords(resData).join(" "),
                '',
                data.url
            );
            product.insert(client, function () {
                count++;
                if (count === datas.datas.length) {
                    client.release();
                }
            });
        }
    });
}

function testAnalysis() {
    var buffer = fs.readFileSync('IMG-1533028336205.json');
    var rawData = JSON.parse(buffer);
    var json = analysis.filterResult(rawData);
    var querywords = analysis.getQueryWords(json);
    db.connect().then(client => {
        db.queryContent(client, querywords, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
    });

}

module.exports = {

    test: function () {
        try {
            insertDatas();
           // testAnalysis();
            // testDatabase();
        } catch (ex) {
            console.log(ex);
        }
    }

};
