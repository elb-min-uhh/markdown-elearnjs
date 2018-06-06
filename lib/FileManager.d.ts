declare class FileManager {
    static getHtmlTemplate(): Promise<string>;
    static getPdfTemplate(): Promise<string>;
    /**
    * Reads in a given file.
    */
    static readFile(filePath: string, callback: (data: string) => any, error?: (err: any) => any): void;
}
export default FileManager;
