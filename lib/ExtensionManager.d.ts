import InclusionObject from './objects/InclusionObject';
/**
* Allows to parse HTML code for usage of elearn.js extensions.
* Allows to get path to extension necessary files.
* Allows to get include strings for extension necessary files.
*/
declare class ExtensionManager {
    static scanForQuiz(html: string): boolean;
    static scanForVideo(html: string): boolean;
    static scanForClickImage(html: string): boolean;
    static scanForTimeSlider(html: string): boolean;
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
    * @param {InclusionObject} opts optional options
    */
    static exportAssets(dirPath: string, opts: InclusionObject): Promise<{}>;
    /**
    * Copies/writes a list of folders by their absolute paths to the outPath
    */
    static writeFolders(folders: string[], outPath: string, callback: () => any, error?: (err: any) => any): void;
}
export default ExtensionManager;
