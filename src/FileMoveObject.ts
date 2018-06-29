"use strict";

class FileMoveObject {
    public inputPath: string;
    public relativeOutputPath: string;

    constructor(inputPath: string, relativeOutputPath: string) {
        this.inputPath = inputPath;
        this.relativeOutputPath = relativeOutputPath;
    }
}

export default FileMoveObject;
