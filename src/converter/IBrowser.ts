"use strict";

import * as Puppeteer from 'puppeteer';

interface IBrowser extends Puppeteer.Browser {
    /**
     * process id
     */
    pid: number;

    /**
     * Number of current locks on the browser.
     */
    locks: number;
}

export default IBrowser;
