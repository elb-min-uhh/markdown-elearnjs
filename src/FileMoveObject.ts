"use strict";

class FileMoveObject {
    inputPath?: string;
    relativeOutputPath?: string;

    constructor(inputPath?: string, relativeOutputPath?: string) {
        if(inputPath !== undefined) this.inputPath = inputPath;
        if(relativeOutputPath !== undefined) this.relativeOutputPath = relativeOutputPath;
    }
}

export default FileMoveObject;