"use strict";

import assert from 'assert';
import * as fs from "fs";

class AssertExtensions {

    public static assertTextFileEqual(text: string, file: fs.PathLike) {
        let ret = new Promise((res, rej) => {
            fs.readFile(file, 'utf8', (err, data) => {
                if(err) {
                    rej(err);
                }
                text = text.replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();
                data = data.replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();

                let difference = "";

                // char compare to find difference
                for(let i = 0; i < text.length; i++) {
                    if(text.charAt(i) !== data.charAt(i)) {
                        difference = `Differs at ${i} with
Generated:
----------
${text.substr(i - 10, 150)}
----------

From File:
----------
${data.substr(i - 10, 150)}
----------\n`;
                        break;
                    }
                }

                let correct = text.localeCompare(data) === 0;

                if(correct) {
                    res();
                }
                else {
                    rej(difference);
                }
            });
        });
        return ret;
    }

    public static assertTextFilesEqual(file1: fs.PathLike, file2: fs.PathLike) {
        let outputFileBuf = fs.readFileSync(file1, { encoding: 'utf8' });
        let text = outputFileBuf.toString();
        return AssertExtensions.assertTextFileEqual(text, file2);
    }

    public static assertFilesEqual(file1: fs.PathLike, file2: fs.PathLike) {
        let text1 = fs.readFileSync(file1).toString().replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();
        let text2 = fs.readFileSync(file2).toString().replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();
        assert.equal(text1.toString(), text2.toString());
    }

}

export default AssertExtensions;
