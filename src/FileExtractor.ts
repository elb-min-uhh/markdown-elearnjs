"use strict";

import * as fs from 'fs';
import * as path from 'path';

import { FileExtractorObject } from './FileExtractorObject';
import { FileMoveObject } from './FileMoveObject';
import { PromiseCounter } from './util/PromiseCounter';

/**
 * Used for the extraction of linked files in the HTML.
 * This will be used to copy user linked files to the output directory and
 * update the HTML.
 */
export class FileExtractor {
    // Capturing groups: 1, 2 for attributes before src, 3: wrapping char ["'], 4: src value
    private static imageSrcRegExp = /<(img)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
    private static scriptSrcRegExp = /<(script)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
    private static linkHrefRegExp = /<(link)[ \t]((?:(?!href[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)href[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
    private static videoSourceSrcRegExp = /<(source)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;

    private static notHttpRegExp = /^(?!https?).*/g;

    /**
     * Copies all files given by their FileMoveObjects from their inputRoot
     * to the outputRoot.
     * @param files the files to copy
     * @param inputRoot the root for relative paths as input
     * @param outputRoot the root directory to copy the files to
     * @param timeout an optional timeout in ms.
     */
    public static extractAll(files: FileMoveObject[], inputRoot: string, outputRoot: string, timeout?: number) {
        let promises: Promise<void>[] = [];

        for(let file of files) {
            if(!file.inputPath || !file.relativeOutputPath) continue;
            let inputPath = path.isAbsolute(file.inputPath) ?
                path.resolve(file.inputPath).replace(/\\/g, "/")
                : path.resolve(`${inputRoot}/${file.inputPath}`).replace(/\\/g, "/");
            let outputPath = path.resolve(`${outputRoot}/${file.relativeOutputPath}`).replace(/\\/g, "/");

            let promise = FileExtractor.copyFile(inputPath, outputPath, true);
            promises.push(promise);
        }

        return new Promise<void>((resolve, reject) => {
            new PromiseCounter(promises, timeout).then(resolve, reject);
        });
    }

    /**
     * Replace all links in the HTML. This will assert that the files
     * were extracted to a `assets` folder.
     * The returned `FileExtractorObject` will contain the updated HTML with
     * relative paths to the assets folder and a list of `FileMoveObject`s
     * used by `extractAll()` to actually extract the files.
     * @param html the html to change
     */
    public static replaceAllLinks(html: string) {
        let files: FileMoveObject[] = [];
        let fileExtractorObject;

        // process images
        fileExtractorObject = FileExtractor.replaceImages(html);
        html = fileExtractorObject.html;
        files = files.concat(fileExtractorObject.files);

        // process images
        fileExtractorObject = FileExtractor.replaceScripts(html);
        html = fileExtractorObject.html;
        files = files.concat(fileExtractorObject.files);

        // process images
        fileExtractorObject = FileExtractor.replaceStyleSheets(html);
        html = fileExtractorObject.html;
        files = files.concat(fileExtractorObject.files);

        // process images
        fileExtractorObject = FileExtractor.replaceVideoSource(html);
        html = fileExtractorObject.html;
        files = files.concat(fileExtractorObject.files);

        return new FileExtractorObject(html, files);
    }

    /**
     * Replace all image sources.
     * @param html The html to parse.
     */
    private static replaceImages(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(FileExtractor.imageSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return FileExtractor.processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    /**
     * Replace all script sources.
     * @param html The html to parse.
     */
    private static replaceScripts(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(FileExtractor.scriptSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return FileExtractor.processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    /**
     * Replace all style sources.
     * @param html The html to parse.
     */
    private static replaceStyleSheets(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(FileExtractor.linkHrefRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return FileExtractor.processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    /**
     * Replace all video sources.
     * @param html The html to parse.
     */
    private static replaceVideoSource(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(FileExtractor.videoSourceSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return FileExtractor.processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    /**
     * Process the source replacement. Replacement function used for specific
     * regexp replacement.
     * @param wholeMatch the whole match
     * @param tag the html elements tag (e.g. `img`)
     * @param before all attributes before the actual attribute containing the path (e.g. `style="..."`)
     * @param wrapBefore the wrapping char (e.g. `"`) of the last attribute before the necessary [only used inside regex]
     * @param wrap the wrapping char (e.g. `"`) of the necessary element
     * @param val the actual path
     * @param after everything after the necessary attribute
     * @param closingSlash a closing slash if included
     * @param files the list of `FileMoveObject` to append this one to
     */
    private static processSourceReplacement(wholeMatch: string, tag: string, before: string, wrapBefore: string,
        wrap: string, val: string, after: string, closingSlash: string, files: FileMoveObject[]) {

        let ret = wholeMatch;

        // update and extract if local file
        if(val.match(FileExtractor.notHttpRegExp)) {
            let fileName = path.basename(val);

            let inputPath = val;

            // replace val
            switch(tag.toLowerCase()) {
                case "img":
                case "source":
                    val = `assets/img/${fileName}`; break;
                case "script":
                    val = `assets/js/${fileName}`; break;
                case "link":
                    val = `assets/css/${fileName}`; break;
            }

            let outputPath = val;

            if(inputPath !== outputPath) {
                files.push(new FileMoveObject(inputPath, outputPath));
            }

            switch(tag.toLowerCase()) {
                case "img":
                case "source":
                case "script": ret = `<${tag} ${before ? before : ""}src=${wrap}${val}${wrap}${after ? after : ""}${closingSlash ? closingSlash : ""}>`; break;
                case "link": ret = `<${tag} ${before ? before : ""}href=${wrap}${val}${wrap}${after ? after : ""}${closingSlash ? closingSlash : ""}>`; break;
            }
        }

        return ret;
    }

    /**
     * Copy a file, creates nonexistent directories
     *
     * @return Promise<void>: resolves when done.
     */
    private static copyFile(source: string, target: string, ignoreNotExistent?: boolean) {
        let promise = new Promise<void>((resolve, reject) => {
            source = decodeURI(source);
            target = decodeURI(target);

            // do not overwrite with itself [will create a 0B file]
            if(path.resolve(source) === path.resolve(target)) {
                resolve();
                return;
            }

            // nonexistent source
            if(!fs.existsSync(source)) {
                if(!ignoreNotExistent) {
                    reject(`File does not exist ${source}`);
                }
                else {
                    resolve();
                }
                return;
            }

            let ensureDirectoryExistence = (filePath: string) => {
                let dirname = path.dirname(filePath);
                if(fs.existsSync(dirname)) {
                    return true;
                }
                ensureDirectoryExistence(dirname);
                fs.mkdirSync(dirname);
            };
            ensureDirectoryExistence(target);

            let rd = fs.createReadStream(source);
            rd.on("error", (err: any) => {
                reject(err);
            });
            let wr = fs.createWriteStream(target);
            wr.on("error", (err: any) => {
                reject(err);
            });
            wr.on("close", (ex: any) => {
                resolve();
            });
            rd.pipe(wr);
        });
        return promise;
    }
}
