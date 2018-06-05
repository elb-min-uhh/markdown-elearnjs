"use strict";
exports.__esModule = true;
/**
* Used to return information about file extraction process.
* Contains changed HTML (replaced relative links)
* and found files.
*/
var FileExtractorObject = /** @class */ (function () {
    /**
    * @param html: string of html after fileExtraction,
    *              all `files` are changed in the html.
    *              if `files` is empty, the html was not changed by the
    *              FileExtractor parsing
    * @param files: FileMoveObject[], containing multiple files of type
    *               {inputPath: ..., relativeOutputPath: ...}
    */
    function FileExtractorObject(html, files) {
        if (html)
            this.html = html;
        if (files)
            this.files = files;
    }
    return FileExtractorObject;
}());
exports["default"] = FileExtractorObject;
//# sourceMappingURL=FileExtractorObject.js.map