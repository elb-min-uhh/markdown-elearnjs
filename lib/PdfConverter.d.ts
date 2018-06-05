import * as Showdown from "showdown";
import * as HtmlPdf from 'html-pdf';
import PdfSettingsObject from './objects/PdfSettingsObject';
import ConversionObject from './objects/ConversionObject';
import PdfExportOptionObject from './objects/PdfExportOptionObject';
import InclusionObject from './objects/InclusionObject';
declare class PdfConverter {
    pdfBodyConverter: Showdown.Converter;
    /**
    * Creates an HtmlConverter with specific options.
    * @param {PdfSettingsObject} options: optional options
    */
    constructor(options: PdfSettingsObject);
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
    setOptions(options: PdfSettingsObject): void;
    /**
    * Converts given markdown to a HTML string for a HTML to PDF conversion.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return {Promise<string>} - will resolve with the output html, when done.
    */
    toPdfHtml(markdown: string, options: ConversionObject): Promise<string>;
    /**
    * Converts given markdown to a PDF File.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
    */
    toFile(markdown: string, file: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean): Promise<{}>;
    /**
    * Converts given markdown to a pdf file stream.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
    */
    toStream(markdown: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean): Promise<{}>;
    /**
    * Converts given markdown to a pdf file buffer.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
    */
    toBuffer(markdown: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean): Promise<{}>;
    /**
    * Inserts necessary elements into the PDF Template to create the
    * final fileContent.
    *
    * @param data: the content of the template_pdf.html as string
    * @param html: the base HTML as generated HTML Body of the file
    * @param meta: additional header elements for the HTML file
    * @param opts: InclusionObject
    */
    getPDFFileContent(data: string, html: string, meta: string, opts?: InclusionObject): string;
    /**
    * Generates the PDF output options for the used node-html-pdf package.
    * @param filePath path to the currently opened file, necessary to link
    *                 included assets.
    * @param renderDelay (optional) delay of rendering by the package in ms.
    */
    getPdfOutputOptions(rootPath: string, renderDelay?: number): HtmlPdf.CreateOptions;
    /**
    * The default PDF Header HTML elements
    */
    getDefaultHeader(): string;
    /**
    * The default PDF Footer HTML elements
    */
    getDefaultFooter(): string;
}
export default PdfConverter;
