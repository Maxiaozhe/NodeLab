///<reference path="jquery-3.3.1.js" />
'use strict';
const common = {
    showLoader: function () {
        var loader = $('.loader');
        if (loader.length === 0) {
            loader = $('<div class="loader">Loading...</div>').appendTo($(".main"));
        }
        var body = $("body");
        var left = (body.width() - loader.width()) / 2;
        var top = (body.height() - loader.height()) / 2;
        loader.css({ left: left, top: top });
    },
    hideLoader: function () {
        var loader = $('.loader');
        if (loader.length > 0) {
            loader.remove();
        }
    },
    changeStatus: function () {
        var loader = $('.loader');
        if (loader.length > 0) {
            loader.css("color", "blue");
        }
    }

};


