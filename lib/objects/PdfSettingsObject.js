"use strict";
"use strinct";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConverterSettingsObject_1 = __importDefault(require("./ConverterSettingsObject"));
class PdfSettingsObject extends ConverterSettingsObject_1.default {
    /**
     * An Object containing options for the PdfConverter
     *
     * @param newSectionOnHeading: bool - if sections are automatically created
     *      at headings.
     *      Default: true
     * @param headingDepth : int - until which depth headings are created.
     *      Default: 3 (H3)
     * @param useSubSections : bool - if sub- and subsubsections are created
     *      at a specific heading level (subSectionLevel, subsubSectionLevel)
     *      Default: true.
     * @param subSectionLevel : int - level from which on created sections are subsections.
     *      Default: 3 (H3)
     * @param subsubSectionLevel : int - level from which on sections are subsubsections.
     *      Default: 4 (H4) (will not be created with everything as default)
     * @param newPageOnSection : bool - will add page breaks before every section
     * @param contentZoom : float - zoom factor for the page rendering
     * @param customHeader : string - HTML of a custom page header
     * @param customFooter : string - HTML of a custom page footer
     * @param headerHeight : string - CSS declaration of the header's height
     * @param footerHeight : string - CSS declaration of the footer's height
     * @param customStyleFile : string - absolute path to a styling css file
     */
    constructor(newSectionOnHeading, headingDepth, useSubSections, subSectionLevel, subsubSectionLevel, newPageOnSection, contentZoom, customHeader, customFooter, headerHeight, footerHeight, customStyleFile) {
        super(newSectionOnHeading, headingDepth, useSubSections, subSectionLevel, subsubSectionLevel);
        this.newPageOnSection = true;
        this.contentZoom = 1;
        this.headerHeight = "0";
        this.footerHeight = "17mm";
        if (newPageOnSection !== undefined)
            this.newPageOnSection = newPageOnSection;
        if (contentZoom !== undefined)
            this.contentZoom = contentZoom;
        if (customHeader !== undefined)
            this.customHeader = customHeader;
        if (customFooter !== undefined)
            this.customFooter = customFooter;
        if (headerHeight !== undefined)
            this.headerHeight = headerHeight;
        if (footerHeight !== undefined)
            this.footerHeight = footerHeight;
        if (customStyleFile !== undefined)
            this.customStyleFile = customStyleFile;
    }
}
exports.default = PdfSettingsObject;
