"use strict";

/**
 * An object declaring necessary information for a move of a file.
 */
export class FileMoveObject {
    /**
     * The path (including file name) to the file. This might be an absolute
     * path or relative to some root path. If relative the root path is
     * necessary when actually copying the file.
     */
    public inputPath: string;

    /**
     * The relative output path. This one is always relative from a generated
     * output root path. The root path usually contains the generated assets
     * folder.
     * This relative path usually starts with `assets/`.
     */
    public relativeOutputPath: string;

    constructor(inputPath: string, relativeOutputPath: string) {
        this.inputPath = inputPath;
        this.relativeOutputPath = relativeOutputPath;
    }
}
