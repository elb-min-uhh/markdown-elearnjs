"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const assetsPath = '../assets';
class FileManager {
    static getHtmlTemplate() {
        var ret = new Promise((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template.html`, (data) => {
                resolve(data);
            }, (err) => reject(err));
        });
        return ret;
    }
    static getPdfTemplate() {
        var ret = new Promise((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template_pdf.html`, (data) => {
                resolve(data);
            }, (err) => reject(err));
        });
        return ret;
    }
    /**
    * Reads in a given file.
    */
    static readFile(filePath, callback, error) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err && error != null)
                error(err);
            if (callback)
                callback(data);
        });
    }
}
exports.default = FileManager;
