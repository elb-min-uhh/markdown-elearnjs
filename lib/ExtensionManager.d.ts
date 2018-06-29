import HtmlConverter from './HtmlConverter';
import MarkdownConverter from './MarkdownConverter';
import ExtensionObject from './objects/ExtensionObject';
/**
* Allows to parse HTML code for usage of elearn.js extensions.
* Allows to get path to extension necessary files.
* Allows to get include strings for extension necessary files.
*/
declare class ExtensionManager {
    static htmlConverter: HtmlConverter;
    static scanForQuiz(html: string): boolean;
    static scanForVideo(html: string): boolean;
    static scanForClickImage(html: string): boolean;
    static scanForTimeSlider(html: string): boolean;
    /**
     * Scans the html code for elearn.js extensions.
     *
     * @param html string: the html code to be scanned
     *
     * @return ExtensionObject: including which extensions where found
     * and explicitly which were not found (true/false)
     */
    static scanHtmlForAll(html: string): ExtensionObject;
    /**
     * Scans the markdown code for elearn.js extensions.
     *
     * @param markdown string: the original markdown code to be scanned
     * @param markdownConverter (optional) HtmlConverter or PdfConverter:
     *  the converter to use for markdown to HTML conversion. If not given,
     *  a default HtmlConverter will be used.
     *
     * @return Promise<ExtensionObject>: including which extensions where found
     * and explicitly which were not found (true/false)
     */
    static scanMarkdownForAll(markdown: string, markdownConverter?: MarkdownConverter): Promise<ExtensionObject>;
    static getQuizAssetDir(): string;
    static getElearnVideoAssetDir(): string;
    static getClickImageAssetDir(): string;
    static getTimeSliderAssetDir(): string;
    static getHTMLAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean): string;
    static getHTMLAssetString(name: string): string;
    static getQuizHTMLAssetString(): string;
    static getElearnVideoHTMLAssetString(): string;
    static getClickImageHTMLAssetString(): string;
    static getTimeSliderHTMLAssetString(): string;
    static getPDFAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean): string;
    static getQuizPDFAssetString(): string;
    static getElearnVideoPDFAssetString(): string;
    static getClickImagePDFAssetString(): string;
    static getTimeSliderPDFAssetString(): string;
    /**
    * Writes the elearn.js assets to the given path.
    * @param dirPath: string - the path to write the `assets` folder to.
    * @param {ExtensionObject} opts optional options
    */
    static exportAssets(dirPath: string, opts: ExtensionObject): Promise<{}>;
    /**
    * Copies/writes a list of folders by their absolute paths to the outPath
    */
    static writeFolders(folders: string[], outPath: string, callback: () => any, error?: (err: any) => any): void;
}
export default ExtensionManager;
