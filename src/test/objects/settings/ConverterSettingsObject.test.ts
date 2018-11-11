"use strict";

import assert from 'assert';
import { ConverterSettingsObject } from '../../../objects/settings/ConverterSettingsObject';

describe("ConverterSettingsObject", () => {

    it('creates default correctly', () => {
        let values = {
            newSectionOnHeading: true,
            headingDepth: 3,
            useSubSections: true,
            subSectionLevel: 3,
            subsubSectionLevel: 4,
        } as ConverterSettingsObject;
        let inclusionObject = new ConverterSettingsObject();
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly', () => {
        let values = {
            newSectionOnHeading: false,
            headingDepth: 2,
            useSubSections: false,
            subSectionLevel: 2,
            subsubSectionLevel: 5,
        } as ConverterSettingsObject;
        let inclusionObject = new ConverterSettingsObject(values);
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly without additional keys', () => {
        let values = {
            newSectionOnHeading: false,
            headingDepth: 2,
            useSubSections: false,
            subSectionLevel: 2,
            subsubSectionLevel: 5,
        } as ConverterSettingsObject;

        let moreValues = Object.assign({
            newPageOnSection: false,
            contentZoom: 2,
            customHeader: "header",
            customFooter: "footer",
            headerHeight: "15cm",
            footerHeight: "2px",
            customStyleFile: "file",
            chromePath: "chrome",
            puppeteerOptions: {},
            keepChromeAlive: true,
            exportLinkedFiles: true,
        }, values);

        let inclusionObject = new ConverterSettingsObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
