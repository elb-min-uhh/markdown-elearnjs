"use strict";

import * as fs from 'fs';

const assetsPath = '../assets';

class FileManager {
    public static async getHtmlTemplate() {
        return await FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template.html`);
    }

    public static async getPdfTemplate() {
        return await FileManager.readFile(`${__dirname}/${assetsPath}/elearnjs/template_pdf.html`);
    }

    /**
     * Reads in a given file.
     */
    private static readFile(filePath: string) {
        let ret = new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                // will not reject, because it is only used by tested methods above
                resolve(data);
            });
        });
        return ret;
    }
}

export default FileManager;
