﻿///<reference path="jquery-3.3.1.js" />
///<reference path="megapix-image.js" />
///<reference path="common.js" />

const client = {};
(function ($) {

    client.clientID = getUniqueID(1000);

    $.fn.extend({
        /**
         *ファイルアップロードコンボ作成
         * @param {Element} fileInput ファイル入力フィールド
         * @returns {any} filePicker
         * 
         */
        fileUploader: function (fileInput,button) {
            var filePicker = $(this);
            filePicker.attr('dropzone', 'copy file:');
            filePicker.on('dragenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
                $(filePicker).addClass('dragover');
            }).on('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            }).on('drop', function (e) {
                $(filePicker).removeClass('dragover');
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                common.showLoader($(".preview-area"));
                uploadImage(files[0], function () {
                    //アップロード処理完了
                    common.changeStatus();
                });
            }).on('dragout', function (e) {
                $(filePicker).removeClass('dragover');
                e.stopPropagation();
                e.preventDefault();
            });

            $(fileInput).on("change", function () {
                let files = $(this).get(0).files;
                if (files) {
                    // アップロード処理を行うメソッド
                    common.showLoader($(".preview-area"));
                    uploadImage(files[0], function () {
                        //アップロード処理完了
                        //alert("Uploaded!!!!");
                        common.changeStatus();
                    });
                }
            });

            //filePicker.on("click", function () {
            //    $(fileInput).get(0).click();
            //});
            $(button).on("click", function () {
                $(fileInput).get(0).click();
            });


            $(document).on('dragenter dragover drop', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            return filePicker;
        }
    });

    /**
    *(内部関数)AJAXでファイルアップロードする
    * @param {File[]} files ファイル配列
    * @param {Function} callback callback関数
    */
    function handleFileUpload(files, callback) {
        let successCount = 0;
        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            let formData = new FormData();
            formData.append('file', file);
            var uploadURL = "./upload"; //Upload URL
            var jqXHR = $.ajax({
                url: uploadURL,
                type: "POST",
                contentType: false,
                processData: false,
                cache: false,
                data: formData,
                success: function (data) {
                    callback(data);
                }.bind(file),
                error: function (data) {
                    alert(data);
                }
            });
        }
    }

    /**
    *(内部関数)AJAXでファイルアップロードする
    * @param {Blob} blob blobデータ
    * @param {string} name ファイル名
    * @param {Function} callback callback関数
    */
    function handleImgUpload(blob, name, callback) {
        let successCount = 0;
        let formData = new FormData();
        formData.append('file', blob, name);
        formData.append('clientID', client.clientID);
        var uploadURL = "./upload"; //Upload URL
        var jqXHR = $.ajax({
            url: uploadURL,
            type: "POST",
            contentType: false,
            processData: false,
            cache: false,
            //           mimeType: "multipart/form-data",
            data: formData,
            success: function (data) {
                callback(data);
            },
            error: function (data) {
                let error = JSON.stringify(data);
                alert(error);
            }
        });
    }

    /* on Page Loaded */
    $(function () {
        //画像
        $("#droparea").fileUploader($("#fileupload"), $('#camera'));
    });

    /**
     * 画像を圧縮してアップロードする
     * @param {File} imageFile 画像ファイル
     * @param {Function} callback Callback関数
     */
    function uploadImage(imageFile, callback) {
        let reader = new FileReader();
        let img = new Image();
        $(reader).on("load", function (e) {
            img.src = e.target.result;
            $(img).addClass("img img-responsive");
            $(".preview-area").children().remove();
            $(img).appendTo($(".preview-area"));
        });
        $(img).on("load", function () {
            let orgW = this.width;
            let orgH = this.height;
            let maxW = 2048, maxH = 2048;
            let rate = orgW / orgH;
            let targetW = orgW, targetH = orgH;
            if (rate > 1.0) {
                if (orgW > maxW) {
                    targetW = maxW;
                    targetH = targetW / rate;
                }
            } else {
                if (orgH > maxH) {
                    targetH = maxH;
                    targetW = targetH * rate;
                }
            }
            let canvas = document.createElement("canvas");
            //let context = canvas.getContext("2d");
            //canvas.width = targetW;
            //canvas.height = targetH;
            //context.clearRect(0, 0, targetW, targetH);
            //context.drawImage(img, 0, 0, targetW, targetH);
            let magaImg = new MegaPixImage(img);
            
            magaImg.render(canvas, { width: targetW, height: targetH });
            if(canvas.msToBlob){
                  let msBlob = canvas.msToBlob();
                  handleImgUpload(msBlob, imageFile.name, callback);  
                  return;  
            }
            let imgData = canvas.toBlob(function (bolb) {
                handleImgUpload(bolb, imageFile.name, callback);
            }, imageFile.type);
        });
        reader.readAsDataURL(imageFile);
    }


    /**
      * WebScoket Client 登録
      * @param {string} wshost:ws://localhost:8080の形式
      * @returns {WebSocket} WebSocket
      */
    function wsClientRegist(wshost) {
        var lockReconnect = false;  //reconnect locker
        let clientID = client.clientID;
        let ws = createWebSocket();
        function createWebSocket() {
            try {
                let wsclient = new WebSocket(wshost);
                wsclient.onopen = function (e) {
                    console.log('Connection to server opened=>' + 'clientID: ' + clientID);
                    sendMessage('open');
                };
                wsclient.onmessage = function (event) {
                    let data = event.data;
                    if (typeof data === 'string' && data === 'pong') {
                        console.log("pong!");
                        $("#wsstate").prop('class', 'connecting');
                        heartCheck.reset().start();
                        return;
                    }
                    common.hideLoader();
                    jumpToUrl(event.data);
                };
                wsclient.onclose = function (e) {
                    console.log('connection closed.');
                    reconnect();
                };
                return wsclient;
            } catch (ex) {
                console.error(ex);
                reconnect();
            }
        }

        function sendMessage(state, data) {
            let msg = {
                id: clientID,
                state: state,
                type: 'iwb',
                data: data
            };
            ws.send(JSON.stringify(msg));
        }

        //reconnect
        function reconnect() {
            if (lockReconnect) return;
            lockReconnect = true;
            $("#wsstate").prop('class', 'closed');
            setTimeout(function () {
                client.clientID = getUniqueID(1000);
                clientID = client.clientID;
                ws = createWebSocket();
                lockReconnect = false;
            }, 2000);
        }

        //Hard check
        var heartCheck = {
            timeout: 540000,
            timeoutObj: null,
            serverTimeoutObj: null,
            reset: function () {
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this;
            },
            start: function () {
                var self = this;
                this.timeoutObj = setTimeout(function () {
                    sendMessage("ping");
                    console.log("ping!");
                    self.serverTimeoutObj = setTimeout(function () {
                        $("#wsstate").prop('class', 'closed');
                        ws.close();
                    }, self.timeout);
                }, this.timeout);
            }
        };
        return ws;
    }


    function jumpToUrl(strJson) {
        let data = {};
        try {
            data = JSON.parse(strJson);
        } catch (ex) {
            return;
        }
        if (data && data.url) {
            client.fullwin = openFullScreenWindow(data.url);
        }
    }

    function openFullScreenWindow(url) {
        if (client.fullwin) {
            try {
                client.fullwin.close();
            } catch (ex) {
                console.log(ex);
            }
            client.fullwin = null;
        }
        let fullwin = window.open(url, 'fullwin', 'fullscreen=yes,ToolBar=No,Location=No,Directories=No,MenuBar=No,Status=no,scrollbars=no,resizable=no');
        try {
            fullwin.outerWidth = screen.availWidth;
            fullwin.outerHeight = screen.availHeight;
            fullwin.resizeTo(screen.availWidth, screen.availHeight);
            fullwin.moveTo(0, 0);
        } catch (ex) {
            console.log(ex);
        }
        return fullwin;
    }

    function getUniqueID(myStrong) {
        let strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16) + '-' + Math.floor(strong * Math.random()).toString(16);
    }

    //Export
    client.wsClientRegist = wsClientRegist;


}(jQuery));
