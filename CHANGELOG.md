## 1.2.2
* Fixed a few bugs with conversion options and TypeScript syntax.
## 1.2.1
* Fixed a major error when converting to PDF file
## 1.2.0
* Fixes for spaces in paths
* Added functionality to the ExtensionManager
    * scan for all extensions at once
* Standardized interface for HtmlConverter and PdfConverter
## 1.1.2
* Update clickimage.js, syntax changes for blocks
## 1.1.1
* More strict TypeScript preferences
* Added `declaration` files (.d.ts)
* Updated elearn.js, quiz.js and elearnvideo.js (usage of sass instead of css)
## 1.1.0
* Converted project source from JavaScript code to TypeScript
## 1.0.4
* Fixes:
    * Fix extraction of encoded URIs
## 1.0.3
* Fixes:
    * Allow absolute file paths to be exported correctly
    * automatic extension detection only if `includeXY` is undefined (not if false)
    * fix an unhandled error in FileManager
## 1.0.2
* Fixes:
    * Fixed an undefined variable
# 1.0.1
* Features:
    * Allow changeable converter options
## 1.0.0
* First version:
    * Convert to HTML string
    * Extract linked files
    * Export elearn.js assets
    * Convert to PDF file, stream or buffer
