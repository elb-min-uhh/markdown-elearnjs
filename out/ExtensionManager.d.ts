import IConverter from './converter/IConverter';
import ExtensionObject from './objects/ExtensionObject';
/**
* Allows to parse HTML code for usage of elearn.js extensions.
* Allows to get path to extension necessary files.
* Allows to get include strings for extension necessary files.
*/
declare class ExtensionManager {
    private static htmlConverter;
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
     * @param IConverter (optional) HtmlConverter or PdfConverter:
     *  the converter to use for markdown to HTML conversion. If not given,
     *  a default HtmlConverter will be used.
     *
     * @return Promise<ExtensionObject>: including which extensions where found
     * and explicitly which were not found (true/false)
     */
    static scanMarkdownForAll(markdown: string, IConverter?: IConverter): Promise<ExtensionObject>;
    private static getQuizAssetDir;
    private static getElearnVideoAssetDir;
    private static getClickImageAssetDir;
    private static getTimeSliderAssetDir;
    static getHTMLAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean): string;
    private static getHTMLAssetString;
    private static getQuizHTMLAssetString;
    private static getElearnVideoHTMLAssetString;
    private static getClickImageHTMLAssetString;
    private static getTimeSliderHTMLAssetString;
    static getPDFAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean): string;
    private static getQuizPDFAssetString;
    private static getElearnVideoPDFAssetString;
    private static getClickImagePDFAssetString;
    private static getTimeSliderPDFAssetString;
    /**
    * Writes the elearn.js assets to the given path.
    * @param dirPath: string - the path to write the `assets` folder to.
    * @param {ExtensionObject} opts optional options
    */
    static exportAssets(dirPath: string, opts: ExtensionObject): Promise<{}>;
    /**
    * Copies/writes a list of folders by their absolute paths to the outPath
    */
    private static writeFolders;
}
export default ExtensionManager;
