"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as Showdown from "showdown";
import { ExtensionManager } from '../ExtensionManager';
import { FileExtractor } from '../FileExtractor';
import { FileManager } from '../FileManager';
import { FileMoveObject } from '../FileMoveObject';
import { ConversionObject } from '../objects/export/ConversionObject';
import { HtmlExportOptionObject } from '../objects/export/HtmlExportOptionObject';
import { InclusionObject } from '../objects/export/InclusionObject';
import { ExtensionObject } from '../objects/ExtensionObject';
import { ConverterSettingsObject } from '../objects/settings/ConverterSettingsObject';
import { PromiseCounter } from '../util/PromiseCounter';
import { AConverter } from './AConverter';
import { IConverter } from './IConverter';
import { IShowdownConverter } from './IShowdownConverter';
import * as elearnExtension from './ShowdownElearnJS';

export class HtmlConverter extends AConverter implements IConverter {

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
        let defaults = new ConverterSettingsObject();
        Object.keys(defaults).forEach((key) => {
            this.converter.setOption(key, defaults[key]);
        });

        // overwrite defaults with given options
        if(options) {
            this.setOptions(options);
        }
    }

    /**
     * Based on the `automaticDetection` it will create a
     * ExtensionObject which states, which extension to include.
     * @param html The HTML to scan if
     * @param opts
     */
    private static fillExtensionOptions(html: string, opts: ExtensionObject, automaticDetection?: boolean) {
        let includes: ExtensionObject = new ExtensionObject(opts);
        if(automaticDetection) {
            if(opts.includeQuiz === undefined)
                includes.includeQuiz = ExtensionManager.scanForQuiz(html);
            if(opts.includeElearnVideo === undefined)
                includes.includeElearnVideo = ExtensionManager.scanForVideo(html);
            if(opts.includeClickImage === undefined)
                includes.includeClickImage = ExtensionManager.scanForClickImage(html);
            if(opts.includeTimeSlider === undefined)
                includes.includeTimeSlider = ExtensionManager.scanForTimeSlider(html);
        }
        return includes;
    }

    public async toHtml(markdown: string, options?: ConversionObject) {
        const self = this;
        let opts = new ConversionObject(options);

        // update converter settings from options
        self.converter.setOption("removeComments", opts.removeComments);
        self.imprintConverter.setOption("removeComments", opts.removeComments);

        let html = self.converter.makeHtml(markdown); // conversion

        if(opts.bodyOnly) {
            return html;
        }

        // create meta and imprint
        let meta = elearnExtension.parseMetaData(markdown);
        let imprint = "";
        // create imprint only if explicitly inserted in markdown
        if(markdown.match(/(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n-->)/g)) {
            imprint = self.imprintConverter.makeHtml(markdown);
        }

        let data = await FileManager.getHtmlTemplate();
        // scan for extensions if necessary
        opts = Object.assign(opts, HtmlConverter.fillExtensionOptions(html, opts, opts.automaticExtensionDetection));
        return self.getHTMLFileContent(data, html, meta, imprint, opts);
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
    public async toFile(markdown: string, file: string, rootPath: string, options?: HtmlExportOptionObject, forceOverwrite?: boolean) {
        const self = this;

        let opts = new HtmlExportOptionObject(options);

        if(!file) {
            throw new Error("No output path given.");
        }
        if(fs.existsSync(file) && !forceOverwrite) {
            throw new Error("File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.");
        }
        // will throw an error if cannot be opened
        await self.tryFileOpen(file);

        let html = await self.toHtml(markdown, opts);

        let filesToExport: FileMoveObject[] = [];
        // find files to export and change links
        if(opts.exportLinkedFiles) {
            let fileExtractorObject = FileExtractor.replaceAllLinks(html);
            html = fileExtractorObject.html;
            filesToExport = filesToExport.concat(fileExtractorObject.files);
        }

        // scan for extensions if necessary
        opts = Object.assign(opts, HtmlConverter.fillExtensionOptions(html, opts, opts.automaticExtensionDetection));

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
        await new PromiseCounter(promises, 30000);

        return file;
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
