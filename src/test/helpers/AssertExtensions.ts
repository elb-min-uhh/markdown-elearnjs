"use strict";

import assert from 'assert';
import * as fs from "fs";

class AssertExtensions {

    public static assertTextFileEqual(text: string, file: fs.PathLike) {
        let data = fs.readFileSync(file, 'utf8');

        text = text.replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();
        data = data.replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();

        assert.equal(text, data);
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
