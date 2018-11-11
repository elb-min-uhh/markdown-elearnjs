"use strict";

import assert from 'assert';
import { ConversionObject } from '../../../objects/export/ConversionObject';

describe("ConversionObject", () => {

    it('creates default correctly', () => {
        let values = {
            language: "en",
            bodyOnly: false,
            automaticExtensionDetection: false,
            removeComments: false,
        } as ConversionObject;
        let inclusionObject = new ConversionObject();
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
        } as ConversionObject;
        let inclusionObject = new ConversionObject(values);
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
        } as ConversionObject;

        let moreValues = Object.assign({ renderDelay: 150 }, values);

        let inclusionObject = new ConversionObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
