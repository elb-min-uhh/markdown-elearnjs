## 1.5.3
* Updated dependencies
* Updated elearn.js to v1.0.9
    * hover-infos fixes
    * hideable and text blocks extensions
## 1.5.2
* Updated dependencies
* Updated elearn.js to v1.0.8
    * hover-infos and gallery function extensions
    * image gallery fixes and minor additions
## 1.5.1
* Updated elearn.js to v1.0.7
    * changing overlay positioning in the `elearn.js` html
## 1.5.0
* General:
    * Option for removing comments in output (`removeComments`)
    * Syntax for always hidden comments (`<!--hide ...-->)
## 1.4.9
* PDF Conversion:
    * removed PDF specific `elearn.js`
    * will run with actual `elearn.js` instead and a few CSS changes
## 1.4.8
* Updated elearn.js to v1.0.6
    * fixing back-button problems
## 1.4.7
* PDF Conversion:
    * implementation of more atomic locks, by wrapping the browser
    * receiving the instance and locking it should not get interrupted
## 1.4.6
* PDF Conversion:
    * use individual browser locking to close browsers seemingly instant
    * updating options or setting `keepChromeAlive` to false works now
    parallel to conversions in process
## 1.4.5
* PDF Conversion:
    * improve browser restarting on parallel settings change
## 1.4.4
* PDF Conversion:
    * reduce risk of tmp file name collision by including random number
    * add test without `keepChromeAlive` flag
## 1.4.3
* Better usage of global Chromium instance
    * only one at a time for parallel started processes
    * correct restart of browser on parallel options change
* Fixed a problem in with certain test cases not terminating
## 1.4.2
* Chromium instance can be kept alive, to not restart on every conversion
    * with `PdfConverter.setOption("keepChromeAlive", true)`
    * needs to be reset to `false`, otherwise the chrome instance will not
    terminate
* Fixed a problem with `setOptions` resetting values to default
## 1.4.1
* Fixed a problem with new PdfSettingsObject keys being omitted
## 1.4.0
* Switched to `Puppeteer` (Chromium) replacing `html-pdf` (PhantomJS) as
PDF Converter
    * extended PDFConverter to support `Puppeteer` specific options
* Code refactoring
* Test extensions and updates
## 1.3.7
* Updated elearn.js css to improve prints
## 1.3.6
* Updated elearn.js css to fix a webkit rendering problem with the overview
## 1.3.5
* Fixed incorrect paragraph creation and clean up
## 1.3.4
* Added busy file check on `PDFConverter.toFile`
* Updated dependencies
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
