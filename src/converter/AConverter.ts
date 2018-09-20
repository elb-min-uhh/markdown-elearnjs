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
        let checkedObject = new ConverterSettingsObject(options);

        let inputKeys = Object.keys(options);

        Object.keys(checkedObject).forEach((key) => {
            // always check if the option is in the input object
            // this way no other option keys are set to default again
            if(inputKeys.indexOf(key) >= 0)
                this.setOption(key, checkedObject[key]);
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
    protected async tryFileOpen(file: fs.PathLike) {
        await new Promise<void>((res, rej) => {
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
    }

}

export default AConverter;
