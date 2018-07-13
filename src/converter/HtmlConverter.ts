"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as Showdown from "showdown";
import ExtensionManager from '../ExtensionManager';
import FileExtractor from '../FileExtractor';
import FileManager from '../FileManager';
import FileMoveObject from '../FileMoveObject';
import ConversionObject from '../objects/export/ConversionObject';
import HtmlExportOptionObject from '../objects/export/HtmlExportOptionObject';
import InclusionObject from '../objects/export/InclusionObject';
import ExtensionObject from '../objects/ExtensionObject';
import ConverterSettingsObject from '../objects/settings/ConverterSettingsObject';
import PromiseCounter from '../util/PromiseCounter';
import AConverter from './AConverter';
import IConverter from './IConverter';
import IShowdownConverter from './IShowdownConverter';
import * as elearnExtension from './ShowdownElearnJS';

const defaults: { [key: string]: any } = {
    newSectionOnHeading: true,
    headingDepth: 3,
    useSubSections: true,
    subSectionLevel: 3,
    subsubSectionLevel: 4,
};

class HtmlConverter extends AConverter implements IConverter {

    protected converter: IShowdownConverter;
    private imprintConverter: IShowdownConverter;

    /**
     * Creates an HtmlConverter with specific options.
     * @param {ConverterSettingsObject} options: optional options
     */
    constructor(options?: ConverterSettingsObject) {
        super();

        this.converter = new Showdown.Converter({
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

        elearnExtension.elearnImprint();

        // set export defaults
        Object.keys(defaults).forEach((key) => {
            this.converter.setOption(key, defaults[key]);
        });

        if(options) {
            this.setOptions(options);
        }
    }

    private static fillExtensionOptions(html: string, opts: ExtensionObject) {
        if(opts.automaticExtensionDetection) {
            if(opts.includeQuiz === undefined)
                opts.includeQuiz = ExtensionManager.scanForQuiz(html);
            if(opts.includeElearnVideo === undefined)
                opts.includeElearnVideo = ExtensionManager.scanForVideo(html);
            if(opts.includeClickImage === undefined)
                opts.includeClickImage = ExtensionManager.scanForClickImage(html);
            if(opts.includeTimeSlider === undefined)
                opts.includeTimeSlider = ExtensionManager.scanForTimeSlider(html);
        }
        return opts;
    }

    public toHtml(markdown: string, options?: ConversionObject) {
        const self = this;
        let opts = new ConversionObject(options);

        let ret = new Promise<string>((res, rej) => {
            let html = self.converter.makeHtml(markdown);// conversion

            if(opts.bodyOnly) {
                res(html);
                return;
            }

            // create meta and imprint
            let meta = elearnExtension.parseMetaData(markdown);
            let imprint = "";
            // create imprint only if explicitally inserted in markdown
            if(markdown.match(/(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n-->)/g)) {
                imprint = self.imprintConverter.makeHtml(markdown);
            }

            FileManager.getHtmlTemplate().then((data) => {
                // scan for extensions if necessary
                opts = Object.assign(opts, HtmlConverter.fillExtensionOptions(html, opts));
                res(self.getHTMLFileContent(data, html, meta, imprint, opts));
            }, (err) => { rej(err); });
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
    public toFile(markdown: string, file: string, rootPath: string, options?: HtmlExportOptionObject, forceOverwrite?: boolean) {
        const self = this;

        let opts = new HtmlExportOptionObject(options);

        return new Promise<string>((res, rej) => {
            if(!file) {
                return rej("No output path given.");
            }
            if(fs.existsSync(file) && !forceOverwrite) {
                return rej("File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.");
            }

            self.toHtml(markdown, opts).then((html) => {
                let filesToExport: FileMoveObject[] = [];
                // find files to export and change links
                if(opts.exportLinkedFiles) {
                    let fileExtractorObject;

                    fileExtractorObject = FileExtractor.replaceAllLinks(html);
                    html = fileExtractorObject.html;
                    filesToExport = filesToExport.concat(fileExtractorObject.files);
                }

                // scan for extensions if necessary
                opts = Object.assign(opts, HtmlConverter.fillExtensionOptions(html, opts));

                let promises: Promise<any>[] = [];

                // write actual html file
                let writePromise = new Promise((resolve, reject) => {
                    fs.writeFile(file, html, (err) => {
                        if(err) reject(err);
                        else resolve();
                    });
                });
                promises.push(writePromise);
                // export assets
                if(opts.exportAssets)
                    promises.push(ExtensionManager.exportAssets(path.dirname(file), <ExtensionObject>opts));
                // export linked files
                if(opts.exportLinkedFiles)
                    promises.push(FileExtractor.extractAll(filesToExport, rootPath, path.dirname(file), 30000));

                // actual finish condition
                let donePromise = new PromiseCounter(promises, 30000);
                donePromise.then(() => { res(file); }, rej);
            }, (err) => { rej(err); });
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
    private getHTMLFileContent(data: string, html: string, meta: string, imprint: string, options?: InclusionObject) {
        let opts = new InclusionObject(options);
        return data.replace(/\$\$meta\$\$/, () => meta)
            .replace(/\$\$extensions\$\$/, () => {
                return ExtensionManager.getHTMLAssetStrings(
                    opts.includeQuiz,
                    opts.includeElearnVideo,
                    opts.includeClickImage,
                    opts.includeTimeSlider);
            })
            .replace(/\$\$imprint\$\$/, () => imprint)
            .replace(/\$\$body\$\$/, () => html)
            .replace(/\$\$language\$\$/, () => {
                if(opts.language && opts.language !== "de") {
                    return `<script>
                                eLearnJS.setLanguage("${opts.language}");
                                try { eLearnVideoJS.setLanguage("${opts.language}") } catch(e){ console.log(e) };
                                try { quizJS.setLanguage("${opts.language}") } catch(e){ console.log(e) };
                            </script>`;
                }
                return "";
            });
    }
}

export default HtmlConverter;
