"use strict";

const Showdown = require('showdown');
const FileManager = require('./FileManager.js');
const ExtensionManager = require('./ExtensionManager.js');
const elearnExtension = require('./ShowdownElearnJS.js');

const defaults = {
    'newSectionOnHeading': true,
    'headingDepth': 3,
    'useSubSections': true,
    'subSectionLevel': 3,
    'subsubSectionLevel': 4,
};

class HtmlConverter {
    /**
    * Creates an HtmlConverter with specific options.
    * @param options: Object (optional)
    *   - newSectionOnHeading: bool - if sections are automatically created
    *       at headings.
    *       Default: true
    *   - headingDepth: int - until which depth headings are created.
    *       Default: 3 (H3)
    *   - useSubSections: bool - if sub- and subsubsections are created
    *       at a specific heading level (subSectionLevel, subsubSectionLevel)
    *       Default: true.
    *   - subSectionLevel: int - level from which on created sections are subsections.
    *       Default: 3 (H3)
    *   - subsubSectionLevel: int - level from which on sections are subsubsections.
    *       Default: 4 (H4) (will not be created with everything as default)
    */
    constructor(options) {
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
    setOption(opt, val) {
        this.bodyConverter.setOption(opt, val);
    }

    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    setOptions(options) {
        for(var key in options) {
            this.bodyConverter.setOption(key, options[key]);
        }
    }

    /**
    * Converts given markdown to a HTML string.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param options: Object with following optional keys:
    *   - bodyOnly: bool - will only return the HTML body.
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "en"
    *   - automaticExtensionDetection: bool - will scan for extensions and
    *       include only those found. Might be overwritten by specific `includeXY`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *
    * @return Promise: (html) - will resolve with the output html, when done.
    */
    toHtml(markdown, options) {
        const self = this;
        if(!options) options = {};

        var ret = new Promise((res, rej) => {
            var html = self.bodyConverter.makeHtml(markdown);// conversion

            if(options.bodyOnly) res(html);

            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);
            var imprint = "";
            // create imprint only if explicitally inserted in markdown
            if(markdown.match(/(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n-->)/g)) {
                imprint = self.imprintConverter.makeHtml(markdown);
            }

            FileManager.getHtmlTemplate().then((data) => {
                if(!options.language) options.language = "en";
                if(options.automaticExtensionDetection) {
                    if(options.includeQuiz == undefined)
                        options.includeQuiz = ExtensionManager.scanForQuiz(html);
                    if(options.includeElearnVideo == undefined)
                        options.includeElearnVideo = ExtensionManager.scanForVideo(html);
                    if(options.includeClickImage == undefined)
                        options.includeClickImage = ExtensionManager.scanForClickImage(html);
                    if(options.includeTimeSlider == undefined)
                        options.includeTimeSlider = ExtensionManager.scanForTimeSlider(html);
                }
                res(self.getHTMLFileContent(data, html, meta, imprint, options));
            }, (err) => { throw err; });
        });

        return ret;
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
    * @param opts: Object with following optional keys:
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "de"
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    */
    getHTMLFileContent(data, html, meta, imprint, opts) {
        return data.replace(/\$\$meta\$\$/, () => {return meta})
            .replace(/\$\$extensions\$\$/, () => {
                return ExtensionManager.getHTMLAssetStrings(
                    opts.includeQuiz,
                    opts.includeElearnVideo,
                    opts.includeClickImage,
                    opts.includeTimeSlider);
            })
            .replace(/\$\$imprint\$\$/, () => {return imprint})
            .replace(/\$\$body\$\$/, () => {return html})
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

module.exports = HtmlConverter;
