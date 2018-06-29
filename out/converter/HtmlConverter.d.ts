import ConverterSettingsObject from '../objects/settings/ConverterSettingsObject';
import ConversionObject from '../objects/export/ConversionObject';
import IConverter from './IConverter';
import HtmlExportOptionObject from '../objects/export/HtmlExportOptionObject';
declare class HtmlConverter implements IConverter {
    private bodyConverter;
    private imprintConverter;
    /**
    * Creates an HtmlConverter with specific options.
    * @param {ConverterSettingsObject} options: optional options
    */
    constructor(options?: ConverterSettingsObject);
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
    /**
    * Converts given markdown to a HTML string.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return Promise: (html) - will resolve with the output html, when done.
    */
    toHtml(markdown: string, options?: ConversionObject): Promise<string>;
    /**
    * Converts given markdown to a PDF File.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param {HtmlExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
    */
    toFile(markdown: string, file: string, rootPath: string, options?: HtmlExportOptionObject, forceOverwrite?: boolean): Promise<string>;
    /**
    * Inserts necessary elements into the HTML Template to create the
    * final fileContent.
    *
    * @param data: the content of the template_pdf.html as string
    * @param html: the converted HTML content, not the whole file, ohne what is
    *              within the elearn.js div.page (check the template)
    * @param meta: the converted meta part. HTML <scripts> and other added to
    *              the html <head>
    * @param imprint: HTML to be inserted into the elearn.js imprint
    * @param {InclusionObject} opts: optional options
    */
    private getHTMLFileContent;
    private static fillExtensionOptions;
}
export default HtmlConverter;
