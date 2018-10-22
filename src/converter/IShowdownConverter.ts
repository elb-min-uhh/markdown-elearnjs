"use strict";

/**
 * Defines necessary methods used on the Showdown.Converter.
 * This makes type imports for Showdown unnecessary for developers using this
 * package.
 */
export interface IShowdownConverter {
    /**
     * @param text The input text (markdown)
     * @return The output HTML
     */
    makeHtml(text: string): string;

    /**
     * Setting a "local" option only affects the specified Converter object.
     *
     * @param optionKey
     * @param value
     */
    setOption(optionKey: string, value: any): void;

    /**
     * Get the option of this Converter instance.
     *
     * @param optionKey
     */
    getOption(optionKey: string): any;
}
