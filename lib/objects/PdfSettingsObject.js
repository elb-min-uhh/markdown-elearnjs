"use strinct";
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var ConverterSettingsObject_1 = require("./ConverterSettingsObject");
var PdfSettingsObject = /** @class */ (function (_super) {
    __extends(PdfSettingsObject, _super);
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
     * @param headerHeight : string - CSS declaration of the header's height
     * @param customFooter : string - HTML of a custom page footer
     * @param footerHeight : string - CSS declaration of the footer's height
     * @param customStyleFile : string - absolute path to a styling css file
     */
    function PdfSettingsObject(newSectionOnHeading, headingDepth, useSubSections, subSectionLevel, subsubSectionLevel, newPageOnSection, contentZoom, customHeader, headerHeight, customFooter, footerHeight, customStyleFile) {
        var _this = _super.call(this, newSectionOnHeading, headingDepth, useSubSections, subSectionLevel, subsubSectionLevel) || this;
        if (newSectionOnHeading !== undefined)
            _this.newSectionOnHeading = newSectionOnHeading;
        if (headingDepth !== undefined)
            _this.headingDepth = headingDepth;
        if (useSubSections !== undefined)
            _this.useSubSections = useSubSections;
        if (subSectionLevel !== undefined)
            _this.subSectionLevel = subSectionLevel;
        if (subsubSectionLevel !== undefined)
            _this.subsubSectionLevel = subsubSectionLevel;
        return _this;
    }
    return PdfSettingsObject;
}(ConverterSettingsObject_1["default"]));
exports["default"] = PdfSettingsObject;
//# sourceMappingURL=PdfSettingsObject.js.map