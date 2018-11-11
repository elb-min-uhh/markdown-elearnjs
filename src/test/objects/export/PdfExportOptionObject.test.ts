"use strict";

import assert from 'assert';
import { PdfExportOptionObject } from '../../../objects/export/PdfExportOptionObject';

describe("PdfExportOptionObject", () => {

    it('creates default correctly', () => {
        let values = {
            language: "en",
            bodyOnly: false,
            automaticExtensionDetection: false,
            removeComments: false,
            renderDelay: 0,
        } as PdfExportOptionObject;
        let inclusionObject = new PdfExportOptionObject();
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly', () => {
        let values = {
            language: "de",
            includeQuiz: true,
            includeElearnVideo: false,
            includeClickImage: true,
            includeTimeSlider: false,
            bodyOnly: true,
            automaticExtensionDetection: true,
            removeComments: true,
            renderDelay: 150,
        } as PdfExportOptionObject;
        let inclusionObject = new PdfExportOptionObject(values);
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly without additional keys', () => {
        let values = {
            language: "de",
            includeQuiz: true,
            includeElearnVideo: false,
            includeClickImage: true,
            includeTimeSlider: false,
            bodyOnly: true,
            automaticExtensionDetection: true,
            removeComments: true,
            renderDelay: 150,
        } as PdfExportOptionObject;

        let moreValues = Object.assign({ exportLinkedFiles: true }, values);

        let inclusionObject = new PdfExportOptionObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
