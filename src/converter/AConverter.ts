"use strict";

import fs from "fs";
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

    /**
     * Checks if the file can be opened in writing mode. Can be used to
     * check if a file is opened in another process before trying to overwrite
     * it.
     *
     * @param file a pathlike parameter declaring the file to check.
     *
     * @return a promise resolved if it can be opened.
     * Rejected with the error if not.
     */
    protected tryFileOpen(file: fs.PathLike) {
        let ret = new Promise<void>((res, rej) => {
            fs.open(file, 'r+', (error, fd) => {
                if(fd !== undefined) {
                    try {
                        fs.closeSync(fd);
                    }
                    catch(err) {
                        console.error(err);
                    }
                }
                if(!error || error.code === "ENOENT") {
                    res();
                }
                else {
                    rej(error);
                }
            });
        });

        return ret;
    }

}

export default AConverter;
