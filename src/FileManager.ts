"use strict";

import * as fs from 'fs';

const assetsPath = '../assets';

class FileManager {
    public static getHtmlTemplate() {
        let ret = new Promise<string>((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template.html`, (data) => {
                resolve(data);
            }, (err: any) => reject(err));
        });

        return ret;
    }

    public static getPdfTemplate() {
        let ret = new Promise<string>((resolve, reject) => {
            FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template_pdf.html`, (data) => {
                resolve(data);
            }, (err: any) => reject(err));
        });

        return ret;
    }

    /**
     * Reads in a given file.
     */
    private static readFile(filePath: string, callback: (data: string) => any, error?: (err: any) => any) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if(err && error !== null && error !== undefined) error(err);
            if(callback) callback(data);
        });
    }
}

export default FileManager;
