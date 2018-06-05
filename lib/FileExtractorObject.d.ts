import FileMoveObject from "./FileMoveObject";
/**
* Used to return information about file extraction process.
* Contains changed HTML (replaced relative links)
* and found files.
*/
declare class FileExtractorObject {
    html: string;
    files: FileMoveObject[];
    /**
    * @param html: string of html after fileExtraction,
    *              all `files` are changed in the html.
    *              if `files` is empty, the html was not changed by the
    *              FileExtractor parsing
    * @param files: FileMoveObject[], containing multiple files of type
    *               {inputPath: ..., relativeOutputPath: ...}
    */
    constructor(html: string, files: FileMoveObject[]);
}
export default FileExtractorObject;
