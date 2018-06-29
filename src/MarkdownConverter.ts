import ExtensionObject from "./objects/ExtensionObject";
import ConversionObject from "./objects/export/ConversionObject";

"use strict";

interface MarkdownConverter {
    toHtml(markdown: string, options?: ConversionObject): Promise<string>;
    toFile(markdown: string, file: string, rootPath: string, options?: ConversionObject, forceOverwrite?: boolean): Promise<string>;
}

export default MarkdownConverter;
