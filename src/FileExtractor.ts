"use strict";

import * as fs from 'fs';
import * as path from 'path';

import FileExtractorObject from './FileExtractorObject';
import FileMoveObject from './FileMoveObject';
import PromiseCounter from './util/PromiseCounter';

// Capturing groups: 1, 2 for attributes before src, 3: wrapping char ["'], 4: src value
let imageSrcRegExp = /<(img)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
let scriptSrcRegExp = /<(script)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
let linkHrefRegExp = /<(link)[ \t]((?:(?!href[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)href[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
let videoSourceSrcRegExp = /<(source)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;

let notHttpRegExp = /^(?!https?).*/g;

const processSourceReplacement = (wholeMatch: string, tag: string, before: string, wrapBefore: string,
    wrap: string, val: string, after: string, closingSlash: string, files: FileMoveObject[]) => {

    let ret = wholeMatch;

    // update and extract if local file
    if(val.match(notHttpRegExp)) {
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
            default:
                // do nothing
                break;
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
};

/**
 * Copy a file, creates nonexistent directories
 *
 * @return Promise<void>: resolves when done.
 */
function copyFile(source: string, target: string, ignoreNotExistent?: boolean) {
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

class FileExtractor {
    public static extractAll(files: FileMoveObject[], inputRoot: string, outputRoot: string, timeout?: number) {
        let promises: Promise<void>[] = [];

        for(let file of files) {
            if(!file.inputPath || !file.relativeOutputPath) continue;
            let inputPath = path.isAbsolute(file.inputPath) ?
                path.resolve(file.inputPath).replace(/\\/g, "/")
                : path.resolve(`${inputRoot}/${file.inputPath}`).replace(/\\/g, "/");
            let outputPath = path.resolve(`${outputRoot}/${file.relativeOutputPath}`).replace(/\\/g, "/");

            let promise = copyFile(inputPath, outputPath, true);
            promises.push(promise);
        }

        return new Promise((resolve, reject) => {
            new PromiseCounter(promises, timeout).then(resolve, reject);
        });
    }

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

    private static replaceImages(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(imageSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    private static replaceScripts(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(scriptSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    private static replaceStyleSheets(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(linkHrefRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    private static replaceVideoSource(html: string) {
        let files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(videoSourceSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }
}

export default FileExtractor;
