"use strict";

import * as fs from 'fs';
import * as path from 'path';
import Puppeteer from 'puppeteer';
import * as Showdown from "showdown";
import _ from 'underscore';
import { ExtensionManager } from '../ExtensionManager';
import { FileManager } from '../FileManager';
import { ConversionObject } from '../objects/export/ConversionObject';
import { InclusionObject } from '../objects/export/InclusionObject';
import { PdfExportOptionObject } from '../objects/export/PdfExportOptionObject';
import { ExtensionObject } from '../objects/ExtensionObject';
import { PdfSettingsObject } from '../objects/settings/PdfSettingsObject';
import { AConverter } from './AConverter';
import { IBrowser } from './IBrowser';
import { IConverter } from './IConverter';
import { IShowdownConverter } from './IShowdownConverter';
import { ShowdownExtensionManager } from './ShowdownExtensionManager';

const assetsPath = '../../assets';

/**
 * Converts Markdown to elearnjs PDF
 */
export class PdfConverter extends AConverter implements IConverter {

    protected converter: IShowdownConverter;
    private browser?: IBrowser;
    private browserPromise?: Promise<IBrowser>;
    private showdownExtensions: ShowdownExtensionManager;

    /**
     * Creates a PdfConverter with specific options.
     * @param {PdfSettingsObject} options: optional options
     */
    constructor(options?: PdfSettingsObject) {
        super();

        this.showdownExtensions = new ShowdownExtensionManager();

        this.converter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: this.showdownExtensions.getPdfBodyExtensions(),
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

    public setOption(opt: string, val: any) {
        // reset browser, if browser specific options change
        if((opt === "chromePath" && this.getOption("chromePath") !== val)
            || (opt === "puppeteerOptions" && !_.isEqual(this.getOption("puppeteerOptions"), val))
            || (opt === "keepChromeAlive" && val === false)) {
            this.closeGlobalBrowser().then();
        }

        super.setOption(opt, val);
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

    public async toHtml(markdown: string, options?: ConversionObject) {
        const self = this;
        let opts = new ConversionObject(options);

        // update converter settings from options
        self.converter.setOption("removeComments", opts.removeComments);

        let html = self.converter.makeHtml(markdown); // conversion

        if(opts.bodyOnly) {
            return html;
        }

        // create meta and imprint
        let meta = this.showdownExtensions.parseMetaData(markdown);

        let data = await FileManager.getPdfTemplate();
        // scan for extensions if necessary
        opts = Object.assign(opts, PdfConverter.fillExtensionOptions(html, opts));
        return self.getPDFFileContent(data, html, meta, opts);
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
     * This will instantiate a chromium browser instance if not present already.
     * Changing the converter options with `setOption` or `setOptions`,
     * as well as starting another conversion process before resolving of this
     * function, might lead to unwanted behavior.
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
        let opts = new PdfExportOptionObject(options);

        let html = await self.toHtml(markdown, <ConversionObject>opts);

        let browser = await self.getBrowserInstance();
        // add lock
        self.lockBrowser(browser);

        const page = await browser.newPage();
        const tmpFile = path.join(rootPath, `.tmpPdfExport_${new Date().getTime()}_${Math.floor(Math.random() * 10000)}.html`);

        fs.writeFileSync(tmpFile, html, "UTF8");

        let buffer;
        try {
            // goto root path
            await page.goto('file:///' + tmpFile.replace('\\', '/'));

            // render delay
            if(opts && opts.renderDelay) {
                await new Promise((res, rej) => {
                    setTimeout(res, opts.renderDelay);
                });
            }

            buffer = await page.pdf(self.getPdfOutputOptions());
            // close the page only if the browser is not closed anyway
            // to prevent race conditions: page.close() / browser.close() might
            // concur even though await is given
            if(self.getOption("keepChromeAlive") && self.isGlobalBrowser(browser)) {
                await page.close();
            }

            // remove lock
            self.unlockBrowser(browser);

            // close local browser
            if(!self.isGlobalBrowser(browser)) {
                await self.closeBrowser(browser);
            }
            // close global browser
            else if(!self.getOption("keepChromeAlive")) {
                await self.closeGlobalBrowser();
            }

            // remove tmp file
            fs.unlinkSync(tmpFile);
        } catch(err) {
            // remove tmp file
            fs.unlinkSync(tmpFile);
            throw err;
        }

        return buffer;
    }

    /**
     * Returns if the Converter has a browser instance. This instance might
     * be still in startup.
     * Will only return false if there is neither a working instance nor an
     * instance starting.
     *
     * @return whether an available or starting instance is present (true) or not (false)
     */
    public hasBrowserInstance() {
        return this.browser !== undefined || this.browserPromise !== undefined;
    }

    /**
     * Starts a puppeteer browser instance. Will use the
     * PDFSettingsObject.chromePath as `executablePath` if set.
     *
     * @return {IBrowser} instance of IBrowser
     */
    private async initBrowser() {
        let options: Puppeteer.LaunchOptions = this.getOption('puppeteerOptions') || {};
        if(this.getOption('chromePath') !== undefined) {
            options.executablePath = this.getOption('chromePath');
        }
        const browser: IBrowser = <IBrowser>await Puppeteer.launch(options);

        browser.pid = (await browser.process()).pid;
        browser.locks = 0;
        console.log("markdown-elearnjs: Initialized new chromium browser. Process ID", browser.pid);

        return browser;
    }

    /**
     * Gets a browser instance to work with.
     * Based on current settings this can be a global instance `this.browser`,
     * or a only local instance.
     * Makes sure there are never multiple browser instances created, when
     * the Option `keepChromeAlive` is set to true.
     *
     * @return the puppeteer browser instance
     */
    private async getBrowserInstance() {
        const self = this;

        let browser = self.browser;
        // init browser if not initiated
        if(browser === undefined) {
            let promise;
            // use promise in progress
            if(self.getOption("keepChromeAlive") && self.browserPromise !== undefined) {
                promise = self.browserPromise;
            }
            // create new browser instance
            else {
                promise = self.initBrowser();
                if(self.getOption("keepChromeAlive")) {
                    self.browserPromise = promise;
                }
            }

            try {
                browser = await promise;
            }
            catch(err) {
                self.browserPromise = undefined;
                throw err;
            }

            // update global instance
            if(self.getOption("keepChromeAlive")
                && self.browser === undefined
                && self.browserPromise === promise) {
                self.browser = browser;
            }

            // remove reference to resolved promise
            if(self.browserPromise !== undefined) {
                self.browserPromise = undefined;
            }
        }

        return browser;
    }

    /**
     * Checks if the given browser references the global browser.
     * @param browser the browser to check
     *
     * @return true if the reference is equal to the global browser
     */
    private isGlobalBrowser(browser: IBrowser) {
        return browser === this.browser;
    }

    /**
     * Closes the current browser instance and resets variables.
     * Resolves when done.
     */
    private async closeGlobalBrowser() {
        let browser = this.browser; // keep locally for later closing

        // remove global references
        this.browser = undefined;
        this.browserPromise = undefined;

        if(browser !== undefined) await this.closeBrowser(browser);
    }

    /**
     * Closes the given browser instance.
     * Resolves when done.
     */
    private async closeBrowser(browser: IBrowser) {
        if(this.isGlobalBrowser(browser)) throw new Error("Cannot close global browser with `closeBrowser`. Please use `closeGlobalBrowser`.");

        // check lock right before closing
        if(browser !== undefined && !this.isLocked(browser)) {
            await browser.close();
            console.log("markdown-elearnjs: Closed chromium browser successfully. Process ID", browser.pid);
        }
    }

    /**
     * Adds a lock for a specific process id (IBrowser.pid)
     * @param pid the id of the browsers process.
     */
    private lockBrowser(browser: IBrowser) {
        browser.locks++;
    }

    /**
     * Removes a lock for a specific process id (IBrowser.pid)
     * @param pid the id of the browsers process.
     */
    private unlockBrowser(browser: IBrowser) {
        browser.locks--;
    }

    /**
     * Returns if the browser process is locked or not.
     * @param pid the id of the browsers process.
     */
    private isLocked(browser: IBrowser) {
        return browser.locks > 0;
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
