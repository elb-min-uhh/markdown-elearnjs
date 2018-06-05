"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileMoveObject {
    constructor(inputPath, relativeOutputPath) {
        if (inputPath !== undefined)
            this.inputPath = inputPath;
        if (relativeOutputPath !== undefined)
            this.relativeOutputPath = relativeOutputPath;
    }
}
exports.default = FileMoveObject;
