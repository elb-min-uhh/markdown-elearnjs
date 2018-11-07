"use strict";

import * as Puppeteer from 'puppeteer';

/**
 * Wraps the Puppteer.Browser in an IBrowser containing specific additional
 * attributes.
 */
export interface IBrowser extends Puppeteer.Browser {
    /**
     * process id
     */
    pid: number;

    /**
     * Number of current locks on the browser.
     */
    locks: number;
}
