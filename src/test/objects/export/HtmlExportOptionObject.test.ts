"use strict";

import assert from 'assert';
import { HtmlExportOptionObject } from '../../../objects/export/HtmlExportOptionObject';

describe("HtmlExportOptionObject", () => {

    it('creates default correctly', () => {
        let values = {
            language: "en",
            bodyOnly: false,
            automaticExtensionDetection: false,
            removeComments: false,
            exportAssets: false,
            exportLinkedFiles: false,
        } as HtmlExportOptionObject;
        let inclusionObject = new HtmlExportOptionObject();
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
            exportAssets: true,
            exportLinkedFiles: true,
        } as HtmlExportOptionObject;
        let inclusionObject = new HtmlExportOptionObject(values);
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
            exportAssets: true,
            exportLinkedFiles: true,
        } as HtmlExportOptionObject;

        let moreValues = Object.assign({ renderDelay: 150 }, values);

        let inclusionObject = new HtmlExportOptionObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
