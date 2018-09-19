"use strict";

import { PathLike } from "fs";
import path from "path";

/**
 *  basic file uri, does not allow ?par... at the end
 */
const fileUriRegExp = /(['"])file:\/{3}(.+?)\1/g;

class AssertExtensions {

    /**
     *
     * @param html Converts all absolute paths like `file:///C:/test/abc.de`
     * to match the relative path `path/to/abc.de`.
     * This will the document html with all absolute file paths replaced with
     * this relative paths.
     * @param outputRoot The root dir from which the relative paths start
     */
    public static removeAbsolutePaths(html: string, outputRoot: PathLike) {
        return html.replace(fileUriRegExp, (wholeMatch, openingQuote, uri) => {
            let relativePath = path.relative(outputRoot.toString(), uri);
            return `${openingQuote}${relativePath}${openingQuote}`.replace(/\\/g, "/");
        });
    }
}

export default AssertExtensions;
