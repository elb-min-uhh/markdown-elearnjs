"use strict";

import assert from 'assert';
import { InclusionObject } from '../../../objects/export/InclusionObject';

describe("InclusionObject", () => {

    it('creates default correctly', () => {
        let values = {
            language: "en",
        } as InclusionObject;
        let inclusionObject = new InclusionObject();
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly', () => {
        let values = {
            language: "de",
            includeQuiz: true,
            includeElearnVideo: false,
            includeClickImage: true,
            includeTimeSlider: false,
        } as InclusionObject;
        let inclusionObject = new InclusionObject(values);
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly without additional keys', () => {
        let values = {
            language: "de",
            includeQuiz: true,
            includeElearnVideo: false,
            includeClickImage: true,
            includeTimeSlider: false,
        } as InclusionObject;

        let moreValues = Object.assign({
            bodyOnly: true,
            automaticExtensionDetection: true,
            removeComments: true,
            renderDelay: 150,
        }, values);

        let inclusionObject = new InclusionObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
