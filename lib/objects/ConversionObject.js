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
var InclusionObject_1 = require("./InclusionObject");
var ConversionObject = /** @class */ (function (_super) {
    __extends(ConversionObject, _super);
    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {boolean} bodyOnly will only return the HTML body.
     * @param {string} language will change the language
     *      if not `bodyOnly`.
     *      Default: "en"
     * @param {boolean} automaticExtensionDetection will scan for extensions and
     *      include only those found. Might be overwritten by specific `includeXY`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} includeQuiz will include the import of the quiz.js in the head.
     *       The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} includeElearnVideo will include the import of the
     *      elearnvideo.js in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} includeClickImage will include the import of the clickimage.js
     *      in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *       Default: false
     * @param {boolean} includeTimeSlider will include the import of the timeslider.js
     *       in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     */
    function ConversionObject(bodyOnly, language, automaticExtensionDetection, includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider) {
        var _this = _super.call(this, includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider, language) || this;
        if (bodyOnly !== undefined)
            _this.bodyOnly = bodyOnly;
        if (automaticExtensionDetection !== undefined)
            _this.automaticExtensionDetection = automaticExtensionDetection;
        return _this;
    }
    return ConversionObject;
}(InclusionObject_1["default"]));
exports["default"] = ConversionObject;
//# sourceMappingURL=ConversionObject.js.map