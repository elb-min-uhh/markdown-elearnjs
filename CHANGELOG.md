## 1.3.3
* Update clickimage.js to support new `data-pins` syntax
## 1.3.2
* Fix language selection in PDF
    * always set language once after loading
## 1.3.1
* Allow language selection for PDF export
    * this will fully allow custom translations
## 1.3.0
* Implement elearn.js function `addTranslation` and `addTranslations` to
actually allow usage of customized translations in PDF export
    * elearn.js internal texts are not visible in PDF output
## 1.2.13
* Updated elearn.js v1.0.5
* Updated quiz.js
* Fixed PDF Export error when using `addTranslation` on `eLearnJS` in the document
## 1.2.12
* Updated elearn.js (develop version)
## 1.2.11
* Added missing files from elearn.js
## 1.2.10
* Updated elearn.js (develop version)
## 1.2.9
* Better test reporting
* Fixes of dependency problems
## 1.2.8
* Extended test cases
## 1.2.7
* Fixes for npm publish packaging
## 1.2.6
* Added Mocha based tests
* Added CI-Runner results to README (only master status)
* Fixed minor option conversion bug in HtmlConverter.toFile
## 1.2.5
* Improved objects further
    * All fields are optional, but creating an object with the constructor
    will fill in default values
## 1.2.4
* Setup tslint
* Refactored code, to match more strict code styles
* Improved input types of object constructors
## 1.2.3
* Add scopes (private/public) to variables and functions
    * this fixes type problems for projects using this package
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
