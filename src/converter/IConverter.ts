"use strict";

import { ConversionObject } from "../objects/export/ConversionObject";
import { ConverterSettingsObject } from "../objects/settings/ConverterSettingsObject";

export interface IConverter {

    /**
     * Converts given markdown to a HTML string.
     * Certain options will specify the output.
     *
     * @param markdown: string - the markdown code
     * @param {ConversionObject} options: optional options
     *
     * @return {Promise<string>} - will resolve with the output html, when done.
     */
    toHtml(markdown: string, options?: ConversionObject): Promise<string>;

    /**
     * Converts given markdown to a PDF File.
     * Certain options will specify the output.
     *
     * @param markdown: string - the markdown code
     * @param file: string - the output file path (including file name)
     * @param rootPath: string - the root path for relative paths in the file.
     * @param {ConversionObject} options: optional options
     * @param forceOverwrite: bool - if an existing file should be overwritten.
     *
     * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
     */
    toFile(markdown: string, file: string, rootPath: string, options?: ConversionObject, forceOverwrite?: boolean): Promise<string>;

    /**
     * Get the value of a specific option key.
     * @param opt The opt to check.
     */
    getOption(opt: string): any;

    /**
     * Update one of the conversion options.
     *
     * @param opt: string - option key. Same possible as in the constructor.
     * @param val: obj - the value to set the option to.
     */
    setOption(opt: string, val: any): void;

    /**
     * Update multiple conversion options.
     * @param options: Object - same as in the constructor
     */
    setOptions(options: ConverterSettingsObject): void;
}
