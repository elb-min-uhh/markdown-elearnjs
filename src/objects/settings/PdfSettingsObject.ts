"use strinct";

import ConverterSettingsObject from "./ConverterSettingsObject";

class PdfSettingsObject extends ConverterSettingsObject {
    /**
     * will add page breaks before every section
     */
    public newPageOnSection?: boolean = true;
    /**
     * zoom factor for the page rendering
     */
    public contentZoom?: number = 1;
    /**
     * HTML of a custom page header
     */
    public customHeader?: string;
    /**
     * HTML of a custom page footer
     */
    public customFooter?: string;
    /**
     * CSS declaration of the header's height
     */
    public headerHeight?: string = "0";
    /**
     * CSS declaration of the footer's height
     */
    public footerHeight?: string = "17mm";
    /**
     * absolute path to a styling css file
     */
    public customStyleFile?: string;

    /**
     * An Object containing options for the PdfConverter
     *
     *  @param {PdfSettingsObject} options:
     *      Manual values for this objects fields. All optional.
     */
    constructor(options?: PdfSettingsObject) {

        super(options);

        const keys = ["newPageOnSection",
            "contentZoom",
            "customHeader",
            "customFooter",
            "headerHeight",
            "footerHeight",
            "customStyleFile"];

        if(options) {
            Object.keys(options).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    this[key] = options[key];
                }
            });
        }
    }
}

export default PdfSettingsObject;
