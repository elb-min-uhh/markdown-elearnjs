"use strinct"

import ConverterSettingsObject from "./ConverterSettingsObject";

class PdfSettingsObject extends ConverterSettingsObject {
    newPageOnSection: boolean = true;
    contentZoom: number = 1;
    customHeader?: string;
    customFooter?: string;
    headerHeight: string = "0";
    footerHeight: string = "17mm";
    customStyleFile?: string;

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
    constructor(newSectionOnHeading?: boolean,
        headingDepth?: number,
        useSubSections?: boolean,
        subSectionLevel?: number,
        subsubSectionLevel?: number,
        newPageOnSection?: boolean,
        contentZoom?: number,
        customHeader?: string,
        customFooter?: string,
        headerHeight?: string,
        footerHeight?: string,
        customStyleFile?: string) {

        super(newSectionOnHeading, headingDepth, useSubSections, subSectionLevel, subsubSectionLevel);
        if(newPageOnSection !== undefined) this.newPageOnSection = newPageOnSection;
        if(contentZoom !== undefined) this.contentZoom = contentZoom;
        if(customHeader !== undefined) this.customHeader = customHeader;
        if(customFooter !== undefined) this.customFooter = customFooter;
        if(headerHeight !== undefined) this.headerHeight = headerHeight;
        if(footerHeight !== undefined) this.footerHeight = footerHeight;
        if(customStyleFile !== undefined) this.customStyleFile = customStyleFile;
    }
}

export default PdfSettingsObject;