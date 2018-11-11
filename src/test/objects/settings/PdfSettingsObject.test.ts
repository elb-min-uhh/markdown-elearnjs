"use strict";

import assert from 'assert';
import { PdfSettingsObject } from '../../../objects/settings/PdfSettingsObject';

describe("PdfSettingsObject", () => {

    it('creates default correctly', () => {
        let values = {
            newSectionOnHeading: true,
            headingDepth: 3,
            useSubSections: true,
            subSectionLevel: 3,
            subsubSectionLevel: 4,
            newPageOnSection: true,
            contentZoom: 1,
            headerHeight: "0",
            footerHeight: "17mm",
            keepChromeAlive: false,
        } as PdfSettingsObject;
        let inclusionObject = new PdfSettingsObject();
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly', () => {
        let values = {
            newSectionOnHeading: false,
            headingDepth: 2,
            useSubSections: false,
            subSectionLevel: 2,
            subsubSectionLevel: 5,
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
        } as PdfSettingsObject;
        let inclusionObject = new PdfSettingsObject(values);
        assert.deepEqual(inclusionObject, values);
    });

    it('creates from input correctly without additional keys', () => {
        let values = {
            newSectionOnHeading: false,
            headingDepth: 2,
            useSubSections: false,
            subSectionLevel: 2,
            subsubSectionLevel: 5,
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
        } as PdfSettingsObject;

        let moreValues = Object.assign({ exportLinkedFiles: true }, values);

        let inclusionObject = new PdfSettingsObject(moreValues);
        assert.deepEqual(inclusionObject, values);
    });

});
