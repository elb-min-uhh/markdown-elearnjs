"use strict";

import * as fs from 'fs';
import * as path from 'path';

import FileExtractorObject from './FileExtractorObject';
import PromiseCounter from './util/PromiseCounter';
import FileMoveObject from './FileMoveObject';

// Capturing groups: 1, 2 for attributes before src, 3: wrapping char ["'], 4: src value
var imageSrcRegExp = /<(img)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var scriptSrcRegExp = /<(script)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var linkHrefRegExp = /<(link)[ \t]((?:(?!href[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)href[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var videoSourceSrcRegExp = /<(source)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;

var notHttpRegExp = /^(?!https?).*/g;
var isRelativePath = /\.[\/]/;

var processSourceReplacement = function(wholeMatch: string, tag: string, before: string, wrapBefore: string,
    wrap: string, val: string, after: string, closingSlash: string, files: FileMoveObject[])
{
    var ret = wholeMatch;

    // update and extract if local file
    if(val.match(notHttpRegExp)) {
        var fileName = path.basename(val);

        var inputPath = val;

        // replace val
        switch(tag.toLowerCase()) {
            case "img":
            case "source": val = `assets/img/${fileName}`; break;
            case "script": val = `assets/js/${fileName}`; break;
            case "link": val = `assets/css/${fileName}`; break;
        }

        var outputPath = val;

        if(inputPath !== outputPath) {
            files.push(new FileMoveObject(inputPath, outputPath));
        }

        switch(tag.toLowerCase()) {
            case "img":
            case "source":
            case "script": ret = `<${tag} ${before?before:""}src=${wrap}${val}${wrap}${after?after:""}${closingSlash?closingSlash:""}>`; break;
            case "link": ret = `<${tag} ${before?before:""}href=${wrap}${val}${wrap}${after?after:""}${closingSlash?closingSlash:""}>`; break;
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
    var promise = new Promise<void>((resolve, reject) => {
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

        var ensureDirectoryExistence = function (filePath: string) {
            var dirname = path.dirname(filePath);
            if (fs.existsSync(dirname)) {
                return true;
            }
            ensureDirectoryExistence(dirname);
            fs.mkdirSync(dirname);
        }
        ensureDirectoryExistence(target);

        var cbCalled = false;
        var rd = fs.createReadStream(source);
        rd.on("error", function (err: any) {
            reject(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err: any) {
            reject(err);
        });
        wr.on("close", function (ex: any) {
            resolve();
        });
        rd.pipe(wr);
    });
    return promise;
};

class FileExtractor {
    static extractAll(files: FileMoveObject[], inputRoot: string, outputRoot: string, timeout?: number) {
        var promises : Promise<void>[] = [];

        for(var file of files) {
            if(!file.inputPath || !file.relativeOutputPath) continue;
            var inputPath = path.isAbsolute(file.inputPath) ?
                                path.resolve(file.inputPath).replace(/\\/g, "/")
                                : path.resolve(`${inputRoot}/${file.inputPath}`).replace(/\\/g, "/");
            var outputPath = path.resolve(`${outputRoot}/${file.relativeOutputPath}`).replace(/\\/g, "/");

            var promise = copyFile(inputPath, outputPath, true);
            promises.push(promise);
        }

        return new Promise((resolve, reject) => {
            new PromiseCounter(promises, timeout).then(resolve, reject);
        });
    }

    static replaceAllLinks(html: string) {
        var files : FileMoveObject[] = [];
        var fileExtractorObject;

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

    static replaceImages(html: string) {
        var files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(imageSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    static replaceScripts(html: string) {
        var files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(scriptSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    static replaceStyleSheets(html: string) {
        var files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(linkHrefRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }

    static replaceVideoSource(html: string) {
        var files: FileMoveObject[] = []; // will be filled by processSourceReplacement
        html = html.replace(videoSourceSrcRegExp, (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) => {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject(html, files);
    }
}

export default FileExtractor;
