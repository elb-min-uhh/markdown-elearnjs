"use strict";

import * as fs from 'fs';

const assetsPath = '../assets';

class FileManager {
    static getHtmlTemplate() {
        var ret = new Promise<string>((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template.html`, (data) => {
                resolve(data);
            }, (err: any) => reject(err));
        });

        return ret;
    }

    static getPdfTemplate() {
        var ret = new Promise<string>((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template_pdf.html`, (data) => {
                resolve(data);
            }, (err: any) => reject(err));
        });

        return ret;
    }

    /**
    * Reads in a given file.
    */
    static readFile(filePath: string, callback: (data: string) => any, error?: (err: any) => any) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if(err && error != null) error(err);
            if(callback) callback(data);
        });
    }
}

export default FileManager;
