"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as Showdown from "showdown";
import FileManager from '../FileManager';
import ExtensionManager from '../ExtensionManager';
import ConverterSettingsObject from '../objects/settings/ConverterSettingsObject';
import ConversionObject from '../objects/export/ConversionObject';
import InclusionObject from '../objects/export/InclusionObject';
import MarkdownConverter from './MarkdownConverter';
import HtmlExportOptionObject from '../objects/export/HtmlExportOptionObject';
import FileMoveObject from '../FileMoveObject';
import FileExtractor from '../FileExtractor';
import ExtensionObject from '../objects/ExtensionObject';
import PromiseCounter from '../util/PromiseCounter';
const elearnExtension = require('./ShowdownElearnJS');

const defaults: { [key: string]: any } = {
    'newSectionOnHeading': true,
    'headingDepth': 3,
    'useSubSections': true,
    'subSectionLevel': 3,
    'subsubSectionLevel': 4,
};

class HtmlConverter implements MarkdownConverter {

    bodyConverter: Showdown.Converter;
    imprintConverter: Showdown.Converter;

    /**
    * Creates an HtmlConverter with specific options.
    * @param {ConverterSettingsObject} options: optional options
    */
    constructor(options: ConverterSettingsObject) {
        this.bodyConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnHtmlBody(),
        });
        this.imprintConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnImprint(),
        });

        // set export defaults
        for(var key in defaults) {
            this.bodyConverter.setOption(key, defaults[key]);
        }

        if(options) {
            for(var key in options) {
                this.bodyConverter.setOption(key, options[key]);
            }
        }
    }

    /**
    * Update one of the conversion options.
    *
    * @param opt: string - option key. Same possible as in the constructor.
    * @param val: obj - the value to set the option to.
    */
    setOption(opt: string, val: any) {
        this.bodyConverter.setOption(opt, val);
    }

    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    setOptions(options: ConverterSettingsObject) {
        for(var key in options) {
            this.bodyConverter.setOption(key, options[key]);
        }
    }

    /**
    * Converts given markdown to a HTML string.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return Promise: (html) - will resolve with the output html, when done.
    */
    toHtml(markdown: string, options?: ConversionObject) {
        const self = this;
        var opts: ConversionObject = options || new ConversionObject();

        var ret = new Promise<string>((res, rej) => {
            var html = self.bodyConverter.makeHtml(markdown);// conversion

            if(opts.bodyOnly) res(html);

            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);
            var imprint = "";
            // create imprint only if explicitally inserted in markdown
            if(markdown.match(/(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n-->)/g)) {
                imprint = self.imprintConverter.makeHtml(markdown);
            }

            FileManager.getHtmlTemplate().then((data) => {
                if(!opts.language) opts.language = "en";
                if(opts.automaticExtensionDetection) {
                    if(opts.includeQuiz == undefined)
                        opts.includeQuiz = ExtensionManager.scanForQuiz(html);
                    if(opts.includeElearnVideo == undefined)
                        opts.includeElearnVideo = ExtensionManager.scanForVideo(html);
                    if(opts.includeClickImage == undefined)
                        opts.includeClickImage = ExtensionManager.scanForClickImage(html);
                    if(opts.includeTimeSlider == undefined)
                        opts.includeTimeSlider = ExtensionManager.scanForTimeSlider(html);
                }
                res(self.getHTMLFileContent(data, html, meta, imprint, opts));
            }, (err) => { throw err; });
        });

        return ret;
    }

    /**
    * Converts given markdown to a PDF File.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param {HtmlExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
    */
    toFile(markdown: string, file: string, rootPath: string, options?: HtmlExportOptionObject, forceOverwrite?: boolean) {
        const self = this;
        var opts = options || new HtmlExportOptionObject();

        return new Promise<string>((res, rej) => {
            if(!file)
                throw "No output path given.";
            if(fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";

            self.toHtml(markdown, <ConversionObject>options).then((html) => {
                var filesToExport: FileMoveObject[] = [];
                // find files to export and change links
                if(opts.exportLinkedFiles) {
                    var fileExtractorObject;

                    fileExtractorObject = FileExtractor.replaceAllLinks(html);
                    html = fileExtractorObject.html;
                    filesToExport = filesToExport.concat(fileExtractorObject.files);
                }

                var promises: Promise<any>[] = [];

                // write actual html file
                var writePromise = new Promise((resolve, reject) => {
                    fs.writeFile(file, html, (err) => {
                        if(err) reject(err);
                        else resolve();
                    })
                });
                promises.push(writePromise);
                // export assets
                if(opts.exportAssets)
                    promises.push(ExtensionManager.exportAssets(path.dirname(file), <ExtensionObject>opts));
                // export linked files
                if(opts.exportLinkedFiles)
                    promises.push(FileExtractor.extractAll(filesToExport, rootPath, path.dirname(file), 30000));

                // actual finish condition
                var donePromise = new PromiseCounter(promises, 30000);
                donePromise.then(() => { res(file) }, rej);
            }, (err) => { throw err });
        });
    }

    /**
    * Inserts necessary elements into the HTML Template to create the
    * final fileContent.
    *
    * @param data: the content of the template_pdf.html as string
    * @param html: the converted HTML content, not the whole file, ohne what is
    *              within the elearn.js div.page (check the template)
    * @param meta: the converted meta part. HTML <scripts> and other added to
    *              the html <head>
    * @param imprint: HTML to be inserted into the elearn.js imprint
    * @param {InclusionObject} opts: optional options
    */
    getHTMLFileContent(data: string, html: string, meta: string, imprint: string, opts?: InclusionObject) {
        var options: InclusionObject = opts || new InclusionObject();
        return data.replace(/\$\$meta\$\$/, () => { return meta })
            .replace(/\$\$extensions\$\$/, () => {
                return ExtensionManager.getHTMLAssetStrings(
                    options.includeQuiz,
                    options.includeElearnVideo,
                    options.includeClickImage,
                    options.includeTimeSlider);
            })
            .replace(/\$\$imprint\$\$/, () => { return imprint })
            .replace(/\$\$body\$\$/, () => { return html })
            .replace(/\$\$language\$\$/, () => {
                if(options.language && options.language !== "de") {
                    return `<script>
                                eLearnJS.setLanguage("${options.language}");
                                try { eLearnVideoJS.setLanguage("${options.language}") } catch(e){ console.log(e) };
                                try { quizJS.setLanguage("${options.language}") } catch(e){ console.log(e) };
                            </script>`;
                }
                return "";
            });
    }
}

export default HtmlConverter;
