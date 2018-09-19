"use strict";

import * as fs from 'fs';
import * as path from 'path';
import Puppeteer from 'puppeteer';
import * as Showdown from "showdown";
import ExtensionManager from '../ExtensionManager';
import FileManager from '../FileManager';
import ConversionObject from '../objects/export/ConversionObject';
import InclusionObject from '../objects/export/InclusionObject';
import PdfExportOptionObject from '../objects/export/PdfExportOptionObject';
import ExtensionObject from '../objects/ExtensionObject';
import PdfSettingsObject from '../objects/settings/PdfSettingsObject';
import AConverter from './AConverter';
import IConverter from './IConverter';
import IShowdownConverter from './IShowdownConverter';
import * as elearnExtension from './ShowdownElearnJS';

const assetsPath = '../../assets';

class PdfConverter extends AConverter implements IConverter {

    protected converter: IShowdownConverter;

    /**
     * Creates an HtmlConverter with specific options.
     * @param {PdfSettingsObject} options: optional options
     */
    constructor(options?: PdfSettingsObject) {
        super();

        this.converter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnPdfBody(),
        });

        // set export defaults
        let defaults = new PdfSettingsObject();
        Object.keys(defaults).forEach((key) => {
            this.converter.setOption(key, defaults[key]);
        });

        // overwrite defaults with given options
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

    /**
     * Update multiple conversion options.
     * @param options: Object - same as in the constructor
     */
    public setOptions(options: PdfSettingsObject) {
        let checkedObject = new PdfSettingsObject(options);

        let inputKeys = Object.keys(options);

        Object.keys(checkedObject).forEach((key) => {
            // always check if the option is in the input object
            // this way no other option keys are set to default again.
            if(inputKeys.indexOf(key) >= 0)
                this.setOption(key, checkedObject[key]);
        });
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

            FileManager.getPdfTemplate().then((data) => {
                // scan for extensions if necessary
                opts = Object.assign(opts, PdfConverter.fillExtensionOptions(html, opts));
                res(self.getPDFFileContent(data, html, meta, opts));
            }, (err) => { rej(err); });
        });

        return ret;
    }

    /**
     * Converts given markdown to a HTML string for a HTML to PDF conversion.
     * Certain options will specify the output.
     *
     * @deprecated use `.toHtml` instead
     *
     * @param markdown: string - the markdown code
     * @param {ConversionObject} options: optional options
     *
     * @return {Promise<string>} - will resolve with the output html, when done.
     */
    public toPdfHtml(markdown: string, options?: ConversionObject) {
        return this.toHtml(markdown, options);
    }

    /**
     * Converts given markdown to a PDF File.
     * Certain options will specify the output.
     *
     * @param markdown: string - the markdown code
     * @param file: string - the output file path (including file name)
     * @param rootPath: string - the root path for relative paths in the file.
     * @param {PdfExportOptionObject} options: optional options
     * @param forceOverwrite: bool - if an existing file should be overwritten.
     *
     * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
     */
    public async toFile(markdown: string, file: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean) {
        const self = this;
        if(!file) {
            throw new Error("No output path given.");
        }
        if(fs.existsSync(file) && !forceOverwrite) {
            throw new Error("File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.");
        }

        // will throw an error if cannot be opened
        await self.tryFileOpen(file);

        let buffer = await self.toBuffer(markdown, rootPath, options);
        fs.writeFileSync(file, buffer);

        return file;
    }

    /**
     * Converts given markdown to a pdf file buffer.
     * Certain options will specify the output.
     *
     * @param markdown: string - the markdown code
     * @param file: string - the output file path (including file name)
     * @param rootPath: string - the root path for relative paths in the file.
     * @param {PdfExportOptionObject} options: optional options
     *
     * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
     */
    public async toBuffer(markdown: string, rootPath: string, options?: PdfExportOptionObject) {
        const self = this;
        let opts = self.getPdfOutputOptions();

        let html = await self.toHtml(markdown, <ConversionObject>options);

        const browser = await this.getPuppeteerBrowser();
        const page = await browser.newPage();
        const tmpFile = path.join(rootPath, `.tmpPdfExport_${new Date().getTime()}.html`);

        fs.writeFileSync(tmpFile, html, "UTF8");

        let buffer;
        try {
            // goto root path
            await page.goto('file:///' + tmpFile.replace('\\', '/'));

            // render delay
            if(options && options.renderDelay) {
                await new Promise((res, rej) => {
                    setTimeout(res, options.renderDelay);
                });
            }

            buffer = await page.pdf(opts);
            await browser.close();

            // remove tmp file
            fs.unlinkSync(tmpFile);
        } catch(err) {
            // remove tmp file
            fs.unlinkSync(tmpFile);
        }

        return buffer;
    }

    /**
     * Starts a puppeteer browser instance. Will use the
     * PDFSettingsObject.chromePath as `executablePath` if set.
     *
     * @return instance of Puppeteer.Browser
     */
    private async getPuppeteerBrowser() {
        let options: Puppeteer.LaunchOptions = this.getOption('puppeteerOptions') || {};
        if(this.getOption('chromePath') !== undefined) {
            options.executablePath = this.getOption('chromePath');
        }
        const browser = await Puppeteer.launch(options);
        return browser;
    }

    /**
     * Inserts necessary elements into the PDF Template to create the
     * final fileContent.
     *
     * @param data: the content of the template_pdf.html as string
     * @param html: the base HTML as generated HTML Body of the file
     * @param meta: additional header elements for the HTML file
     * @param opts: InclusionObject
     */
    private getPDFFileContent(data: string, html: string, meta: string, options?: InclusionObject) {
        const self = this;

        let opts: InclusionObject = new InclusionObject(options);

        let zoom = `<style>html {zoom: ${self.converter.getOption('contentZoom')}}</style>`;

        let customStyleFile = self.converter.getOption('customStyleFile');
        let customStyle = "";
        if(customStyleFile && customStyleFile.length > 0 && fs.existsSync(path.resolve(customStyleFile))) {
            customStyleFile = "file:///" + path.resolve(customStyleFile).replace(/\\/g, "/");
            customStyle = `<link rel="stylesheet" type="text/css" href="${customStyleFile}">`;
        }

        return data.replace(/\$\$meta\$\$/, () => meta)
            .replace(/\$\$extensions\$\$/, () => {
                return ExtensionManager.getPDFAssetStrings(
                    opts.includeQuiz,
                    opts.includeElearnVideo,
                    opts.includeClickImage,
                    opts.includeTimeSlider);
            })
            .replace(/\$\$zoom\$\$/, () => zoom)
            .replace(/\$\$custom_style\$\$/, () => customStyle)
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
            })
            .replace(/\$\$assetspath\$\$/g, () => "file:///" + path.resolve(`${__dirname}/${assetsPath}/elearnjs/`).replace(/\\/g, "/"));
    }

    /**
     * Generates the PDF output options for the used node-html-pdf package.
     * @param filePath path to the currently opened file, necessary to link
     *                 included assets.
     * @param renderDelay (optional) delay of rendering by the package in ms.
     */
    private getPdfOutputOptions(): Puppeteer.PDFOptions {
        const self = this;

        // header and footer
        let header = self.converter.getOption('customHeader');
        if(!header) header = self.getDefaultHeader();
        let footer = self.converter.getOption('customFooter');
        if(!footer) footer = self.getDefaultFooter();

        header = this.wrapHeaderFooter(header);
        footer = this.wrapHeaderFooter(footer);

        // legacy support
        header = this.convertKeywords(header);
        footer = this.convertKeywords(footer);

        let opts: Puppeteer.PDFOptions = {
            format: <"A4">"A4",
            margin: {
                top: "18mm",            // default is 0, units: mm, cm, in, px
                right: "23mm",
                bottom: "25mm",
                left: "23mm",
            },
            displayHeaderFooter: true,
            headerTemplate: header,
            footerTemplate: footer,
        };

        opts.margin = this.calculateMargins(opts.margin!,
            self.converter.getOption('headerHeight'),
            self.converter.getOption('footerHeight'));

        return opts;
    }

    private wrapHeaderFooter(html: string) {
        return `<div style="position: relative; box-sizing: border-box; font-size: 7pt; width: 100%;">${html}</div>`;
    }

    private convertKeywords(html: string) {
        html = html.replace(/\{\{page\}\}/g, '<span class="pageNumber"></span>');
        html = html.replace(/\{\{pages\}\}/g, '<span class="totalPages"></span>');
        return html;
    }

    private getDefaultHeader() {
        return `<div></div>`;
    }

    private getDefaultFooter() {
        return `<div style="color: #666; text-align: right;
            padding: 0 16mm 12mm;">{{page}}</div>`;
    }

    /**
     * Calculates the new page margins based on original margins and the
     * given headerHeight and footerHeight.
     *
     * @param margin the Puppeteer.PDFOptions.margin object.
     * @param headerHeight the header height string with units "px", "in", "cm" or "mm"
     * @param footerHeight the footer height string with units "px", "in", "cm" or "mm"
     */
    private calculateMargins(margin: {
        top?: string;
        right?: string | undefined;
        bottom?: string;
        left?: string | undefined;
    }, headerHeight?: string, footerHeight?: string) {
        if(headerHeight) {
            try {
                let headerMM = this.convertUnitsToMMFloat(headerHeight);
                let topMM = this.convertUnitsToMMFloat(margin.top || "0mm");
                if(headerMM !== undefined && topMM !== undefined)
                    margin.top = (headerMM + topMM) + "mm";
            } catch(err) {
                // ignore
            }
        }
        if(footerHeight) {
            try {
                let footerMM = this.convertUnitsToMMFloat(footerHeight);
                let bottomMM = this.convertUnitsToMMFloat(margin.bottom || "0mm");
                if(footerMM !== undefined && bottomMM !== undefined)
                    margin.bottom = (footerMM + bottomMM) + "mm";
            } catch(err) {
                // ignore
            }
        }
        return margin;
    }

    private convertUnitsToMMFloat(value: string) {
        let mm;
        if(value.match(/\d+(\.\d+)?px/)) {
            let px = parseFloat(value.replace(/\D+$/, ''));
            mm = px * 0.264583;
        }
        else if(value.match(/\d+(\.\d+)?in/)) {
            let inch = parseFloat(value.replace(/\D+$/, ''));
            mm = inch * 25.4;
        }
        else if(value.match(/\d+(\.\d+)?cm/)) {
            let cm = parseFloat(value.replace(/\D+$/, ''));
            mm = cm * 10;
        }
        else if(value.match(/\d+(\.\d+)?mm/)) {
            mm = parseFloat(value.replace(/\D+$/, ''));
        }
        return mm;
    }
}

export default PdfConverter;
