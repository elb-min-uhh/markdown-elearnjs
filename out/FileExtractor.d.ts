import FileExtractorObject from './FileExtractorObject';
import FileMoveObject from './FileMoveObject';
declare class FileExtractor {
    static extractAll(files: FileMoveObject[], inputRoot: string, outputRoot: string, timeout?: number): Promise<{}>;
    static replaceAllLinks(html: string): FileExtractorObject;
    private static replaceImages;
    private static replaceScripts;
    private static replaceStyleSheets;
    private static replaceVideoSource;
}
export default FileExtractor;
