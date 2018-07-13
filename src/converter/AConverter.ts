"use strict";

import ConversionObject from "../objects/export/ConversionObject";
import ConverterSettingsObject from "../objects/settings/ConverterSettingsObject";
import IConverter from "./IConverter";
import IShowdownConverter from "./IShowdownConverter";

abstract class AConverter implements IConverter {

    /**
     * The converter used for the main body markdown conversion.
     */
    protected abstract converter: IShowdownConverter;

    public abstract toHtml(markdown: string, options?: ConversionObject): Promise<string>;

    public abstract toFile(markdown: string, file: string, rootPath: string, options?: ConversionObject, forceOverwrite?: boolean): Promise<string>;

    public getOption(opt: string) {
        return this.converter.getOption(opt);
    }

    public setOption(opt: string, val: any) {
        this.converter.setOption(opt, val);
    }

    public setOptions(options: ConverterSettingsObject) {
        options = new ConverterSettingsObject(options);
        Object.keys(options).forEach((key) => {
            this.setOption(key, options[key]);
        });
    }

}

export default AConverter;
