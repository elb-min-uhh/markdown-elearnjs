"use strict";

import Puppeteer from 'puppeteer';
import { AInheritingObject } from "../AInheritingObject";
import { ConverterSettingsObject } from "./ConverterSettingsObject";

/**
 * An object extending the general `ConverterSettingsObject` by specific PDF
 * settings.
 */
export class PdfSettingsObject extends ConverterSettingsObject {

    protected static readonly CLASS_KEYS = [
        "newPageOnSection",
        "contentZoom",
        "customHeader",
        "customFooter",
        "headerHeight",
        "footerHeight",
        "customStyleFile",
        "chromePath",
        "puppeteerOptions",
        "keepChromeAlive",
    ];

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
     * absolute path to the chrome executable.
     * See https://github.com/GoogleChrome/puppeteer#default-runtime-settings
     */
    public chromePath?: string;
    /**
     * Options used to launch puppeteer.
     * See https://pptr.dev/#?product=Puppeteer&version=v1.8.0&show=api-puppeteerlaunchoptions
     *
     * The `Puppeteer.LaunchOptions.executablePath` might be overwritten by
     * the option `chromePath` if set.
     */
    public puppeteerOptions?: Puppeteer.LaunchOptions;
    /**
     * If set to true, the chrome browser process used in the `PdfConverter`
     * will be kept running until the option is set to false again.
     * Otherwise the browser will close automatically after conversion.
     */
    public keepChromeAlive?: boolean = false;

    /**
     * An Object containing options for the PdfConverter
     *
     *  @param {PdfSettingsObject} options:
     *      Manual values for this objects fields. All optional.
     */
    constructor(options?: PdfSettingsObject) {
        super(options);
        AInheritingObject.inheritValues(this, PdfSettingsObject.CLASS_KEYS, options);
    }
}
