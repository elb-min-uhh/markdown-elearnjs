"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* Used to return information about file extraction process.
* Contains changed HTML (replaced relative links)
* and found files.
*/
class FileExtractorObject {
    /**
    * @param html: string of html after fileExtraction,
    *              all `files` are changed in the html.
    *              if `files` is empty, the html was not changed by the
    *              FileExtractor parsing
    * @param files: FileMoveObject[], containing multiple files of type
    *               {inputPath: ..., relativeOutputPath: ...}
    */
    constructor(html, files) {
        this.html = html;
        this.files = files;
    }
}
exports.default = FileExtractorObject;
