"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var FileExtractorObject_1 = require("./FileExtractorObject");
var PromiseCounter_1 = require("./util/PromiseCounter");
var FileMoveObject_1 = require("./FileMoveObject");
// Capturing groups: 1, 2 for attributes before src, 3: wrapping char ["'], 4: src value
var imageSrcRegExp = /<(img)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var scriptSrcRegExp = /<(script)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var linkHrefRegExp = /<(link)[ \t]((?:(?!href[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)href[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var videoSourceSrcRegExp = /<(source)[ \t]((?:(?!src[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3[ \t]*)*)src[ \t]*=[ \t]*(["'])((?:\\\4|(?!\4).)*)\4((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var notHttpRegExp = /^(?!https?).*/g;
var isRelativePath = /\.[\/]/;
var processSourceReplacement = function (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files) {
    var ret = wholeMatch;
    // update and extract if local file
    if (val.match(notHttpRegExp)) {
        var fileName = path.basename(val);
        var file = new FileMoveObject_1["default"]();
        file.inputPath = val;
        // replace val
        switch (tag.toLowerCase()) {
            case "img":
            case "source":
                val = "assets/img/" + fileName;
                break;
            case "script":
                val = "assets/js/" + fileName;
                break;
            case "link":
                val = "assets/css/" + fileName;
                break;
        }
        file.relativeOutputPath = val;
        if (file.inputPath !== file.relativeOutputPath)
            files.push(file);
        switch (tag.toLowerCase()) {
            case "img":
            case "source":
            case "script":
                ret = "<" + tag + " " + (before ? before : "") + "src=" + wrap + val + wrap + (after ? after : "") + (closingSlash ? closingSlash : "") + ">";
                break;
            case "link":
                ret = "<" + tag + " " + (before ? before : "") + "href=" + wrap + val + wrap + (after ? after : "") + (closingSlash ? closingSlash : "") + ">";
                break;
        }
    }
    return ret;
};
/**
* Copy a file, creates nonexistent directories
*
* @return Promise<void>: resolves when done.
*/
function copyFile(source, target, ignoreNotExistent) {
    var promise = new Promise(function (resolve, reject) {
        source = decodeURI(source);
        target = decodeURI(target);
        // do not overwrite with itself [will create a 0B file]
        if (path.resolve(source) === path.resolve(target)) {
            resolve();
            return;
        }
        // nonexistent source
        if (!fs.existsSync(source)) {
            if (!ignoreNotExistent) {
                reject("File does not exist " + source);
            }
            else {
                resolve();
            }
            return;
        }
        var ensureDirectoryExistence = function (filePath) {
            var dirname = path.dirname(filePath);
            if (fs.existsSync(dirname)) {
                return true;
            }
            ensureDirectoryExistence(dirname);
            fs.mkdirSync(dirname);
        };
        ensureDirectoryExistence(target);
        var cbCalled = false;
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            reject(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            reject(err);
        });
        wr.on("close", function (ex) {
            resolve();
        });
        rd.pipe(wr);
    });
    return promise;
}
;
var FileExtractor = /** @class */ (function () {
    function FileExtractor() {
    }
    FileExtractor.extractAll = function (files, inputRoot, outputRoot, timeout) {
        var promises = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var inputPath = path.isAbsolute(file.inputPath) ?
                path.resolve(file.inputPath).replace(/\\/g, "/")
                : path.resolve(inputRoot + "/" + file.inputPath).replace(/\\/g, "/");
            var outputPath = path.resolve(outputRoot + "/" + file.relativeOutputPath).replace(/\\/g, "/");
            var promise = copyFile(inputPath, outputPath, true);
            promises.push(promise);
        }
        return new Promise(function (resolve, reject) {
            new PromiseCounter_1["default"](promises, timeout).then(resolve, reject);
        });
    };
    FileExtractor.replaceAllLinks = function (html) {
        var files = [];
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
        return new FileExtractorObject_1["default"](html, files);
    };
    FileExtractor.replaceImages = function (html) {
        var files = []; // will be filled by processSourceReplacement
        html = html.replace(imageSrcRegExp, function (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject_1["default"](html, files);
    };
    FileExtractor.replaceScripts = function (html) {
        var files = []; // will be filled by processSourceReplacement
        html = html.replace(scriptSrcRegExp, function (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject_1["default"](html, files);
    };
    FileExtractor.replaceStyleSheets = function (html) {
        var files = []; // will be filled by processSourceReplacement
        html = html.replace(linkHrefRegExp, function (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject_1["default"](html, files);
    };
    FileExtractor.replaceVideoSource = function (html) {
        var files = []; // will be filled by processSourceReplacement
        html = html.replace(videoSourceSrcRegExp, function (wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash) {
            return processSourceReplacement(wholeMatch, tag, before, wrapBefore, wrap, val, after, closingSlash, files);
        });
        return new FileExtractorObject_1["default"](html, files);
    };
    return FileExtractor;
}());
exports["default"] = FileExtractor;
//# sourceMappingURL=FileExtractor.js.map