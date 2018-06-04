# markdown-elearnjs

`markdown-elearnjs` is a node.js package for simple markdown conversion
to [elearn.js](https://github.com/elb-min-uhh/elearn.js) based HTML and PDF.
It is used for example by
[atom-elearnjs](https://github.com/elb-min-uhh/atom-elearnjs).

If you want to create your own conversion tool, this library will do all the
actual conversion work so you can focus on the UI and additional features.

## Installation

Use the following

    npm install --save markdown-elearnjs

## Usage

Insert this into your file

```js
const MarkdownElearnJS = require('markdown-elearnjs');
```

### Conversion

To convert some markdown code to Html you can simply use

```js
var htmlConverter = new MarkdownElearnJS.HtmlConverter();

htmlConverter.toHtml(markdown).then((html) => {
    console.log(html);
}, err => console.error(err));
```

Or for Pdf conversion

```js
var pdfConverter = new MarkdownElearnJS.PdfConverter();

// save as file
pdfConverter.toFile(markdown, filePath, rootPath).then((html) => {
    console.log(html);
}, err => console.error(err));

// get a stream
pdfConverter.toStream(markdown, rootPath).then((html) => {
    console.log(html);
}, err => console.error(err));

//get a buffer
pdfConverter.toBuffer(markdown, rootPath).then((html) => {
    console.log(html);
}, err => console.error(err));

// only the html if you want to use your own render framework
pdfConverter.toPdfHtml(markdown).then((html) => {
    console.log(html);
}, err => console.error(err));
```

You can also use conversion options in each function call and specific
converter settings. Check the
[wiki pages](https://github.com/elb-min-uhh/markdown-elearnjs/wiki).

### Export Assets

If you want to export the [elearn.js](https://github.com/elb-min-uhh/elearn.js)
assets, you can simply use

```js
var path = `C://this/is/some/example/path/`;
var options = {
    includeQuiz: true
};
MarkdownElearnJS.ExtensionManager.exportAssets(path, options).then(() => {
    console.log("Successfully exported.");
}, err => console.error(err));
```

The assets will then be stored as `C://this/is/some/example/path/assets/`.
Without any options only the basic `elearn.js` will be exported. In the options
object you can set these values
```js
var options = {
    includeQuiz: true,
    includeElearnVideo: false,
    includeClickImage: true,
    includeTimeSlider: false
};
```

### Extract Linked Files

If you want to extract all files linked in the converted markdown code, use

```js
var fileExtractorObject = MarkdownElearnJS.FileExtractor.replaceAllLinks(html);
// update the converted html to include the new relative paths
html = fileExtractorObject.html;
// extract the files
MarkdownElearnJS.FileExtractor.extractAll(
    fileExtractorObject.files,
    inputRoot,
    outputRoot,
    timeout);
```

The tool will search for all file paths in `img`, `script`, `link` and `source`
Html elements. Those paths will be replaced by relative paths to the asset
folder and the updated html can be found as displayed above.

Also all these files are stored in the `fileExtractorObject.files` array,
which can be used in the `extractAll` function.

The `inputRoot` should lead to the Markdown file, so the relative links in there
can be combined with the `inputRoot` to an absolute path.
The `outputRoot` leads to the parent directory of the `assets` folder.
The timeout (in ms) will cancel the extraction process after some time, if
something went wrong.

## Known Issues

* All platforms:
    * PDF output might break elements at page end (e.g. lines might be broken
        horizontally)
        * Workaround: add forced page break
            `<div style="page-break-before: always;"></div>`
* Windows:
    * _.woff_ fonts are not supported by _phantom.js_, which is used
    in the _.pdf_ conversion process. Fonts might appear differently.
    Consider using a _.ttf_ in the PDF specific CSS file (check the settings)
* Linux/Mac OS:
    * PDF output is zoomed
        * Workaround: zoom factor of ~0.7

## Credits

* [elearn.js](https://github.com/elb-min-uhh/elearn.js) based for output scripts and styles.
* [Showdown](http://showdownjs.com/) used for Markdown to HTML conversion.
* [marcbachmann/node-html-pdf](https://github.com/marcbachmann/node-html-pdf)
used for HTML to PDF conversion.

## License

markdown-elearnjs is developed by
[dl.min](https://www.min.uni-hamburg.de/studium/digitalisierung-lehre/ueber-uns.html)
of Universität Hamburg.

The software is using [MIT-License](http://opensource.org/licenses/mit-license.php).

cc-by Michael Heinecke, Arne Westphal, dl.min, Universität Hamburg
