declare class FileManager {
    static getHtmlTemplate(): Promise<string>;
    static getPdfTemplate(): Promise<string>;
    /**
    * Reads in a given file.
    */
    private static readFile;
}
export default FileManager;
