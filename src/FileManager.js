"use strict";

const fs = require('fs');

const assetsPath = '../assets';

class FileManager {
    static getHtmlTemplate() {
        var ret = new Promise((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template.html`, (data) => {
                resolve(data);
            });
        });

        return ret;
    }

    static getPdfTemplate() {
        var ret = new Promise((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template_pdf.html`, (data) => {
                resolve(data);
            });
        });

        return ret;
    }

    /**
    * Reads in a given file.
    */
    static readFile(filePath, callback, error) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if(err) return error(err);
            if(callback) callback(data);
        });
    }
}

module.exports = FileManager;
