"use strict";

import assert from 'assert';
import { ExtensionObject } from '../../../objects/export/ExtensionObject';

describe("ExtensionObject", () => {

    it('creates default correctly', () => {
        let values = {} as ExtensionObject;
        let inclusionObject = new ExtensionObject();
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly', () => {
        let values = {
            includeQuiz: true,
            includeElearnVideo: false,
            includeClickImage: true,
            includeTimeSlider: false,
        } as ExtensionObject;
        let inclusionObject = new ExtensionObject(values);
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly without additional keys', () => {
        let values = {
            includeQuiz: true,
            includeElearnVideo: false,
            includeClickImage: true,
            includeTimeSlider: false,
        } as ExtensionObject;

        let moreValues = Object.assign({
            language: "de",
            bodyOnly: true,
            automaticExtensionDetection: true,
            removeComments: true,
            renderDelay: 150,
        }, values);

        let inclusionObject = new ExtensionObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
