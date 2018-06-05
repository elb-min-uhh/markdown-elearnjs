import FileExtractorObject from './FileExtractorObject';
import FileMoveObject from './FileMoveObject';
declare class FileExtractor {
    static extractAll(files: FileMoveObject[], inputRoot: string, outputRoot: string, timeout?: number): Promise<{}>;
    static replaceAllLinks(html: string): FileExtractorObject;
    static replaceImages(html: string): FileExtractorObject;
    static replaceScripts(html: string): FileExtractorObject;
    static replaceStyleSheets(html: string): FileExtractorObject;
    static replaceVideoSource(html: string): FileExtractorObject;
}
export default FileExtractor;
