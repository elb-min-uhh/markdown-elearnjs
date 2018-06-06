"use strict";

class FileMoveObject {
    inputPath: string;
    relativeOutputPath: string;

    constructor(inputPath: string, relativeOutputPath: string) {
        this.inputPath = inputPath;
        this.relativeOutputPath = relativeOutputPath;
    }
}

export default FileMoveObject;