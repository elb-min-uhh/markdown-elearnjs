"use strict";
exports.__esModule = true;
var fs = require("fs");
var assetsPath = '../assets';
var FileManager = /** @class */ (function () {
    function FileManager() {
    }
    FileManager.getHtmlTemplate = function () {
        var ret = new Promise(function (resolve, reject) {
            FileManager.readFile(__dirname + "/" + assetsPath + "/elearnjs/template.html", function (data) {
                resolve(data);
            }, function (err) { return reject(err); });
        });
        return ret;
    };
    FileManager.getPdfTemplate = function () {
        var ret = new Promise(function (resolve, reject) {
            FileManager.readFile(__dirname + "/" + assetsPath + "/elearnjs/template_pdf.html", function (data) {
                resolve(data);
            }, function (err) { return reject(err); });
        });
        return ret;
    };
    /**
    * Reads in a given file.
    */
    FileManager.readFile = function (filePath, callback, error) {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err && error != null)
                error(err);
            if (callback)
                callback(data);
        });
    };
    return FileManager;
}());
exports["default"] = FileManager;
//# sourceMappingURL=FileManager.js.map