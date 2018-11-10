# markdown-elearnjs

[![Build Status](https://westarne.de/jenkins/buildStatus/icon?job=markdown-elearnjs/master)](https://westarne.de/jenkins/job/markdown-elearnjs/job/master/)
[![npm](https://westarne.de/jenkins-test-badge/npm/)](https://www.npmjs.com/package/markdown-elearnjs)
[![Test Status](https://westarne.de/jenkins-test-badge/tests/master/)](https://westarne.de/jenkins/job/markdown-elearnjs/job/master/lastCompletedBuild/testReport/)
[![Test Coverage](https://westarne.de/jenkins-test-badge/coverage/master/)](https://westarne.de/jenkins/job/markdown-elearnjs/job/master/CodeCoverage/)

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

or you can import the components you need directly

```typescript
import {
    HtmlConverter,
    PdfConverter,
    ExtensionManager,
    FileExtractor,
    FileExtractorObject
} from 'markdown-elearnjs';
```

### Conversion

To convert some markdown code to Html you can simply use

```js
var htmlConverter = new MarkdownElearnJS.HtmlConverter();

htmlConverter.toFile(markdown, filePath, rootPath).then((filename) => {
    console.log(filename);
}, err => console.error(err));

htmlConverter.toHtml(markdown).then((html) => {
    console.log(html);
}, err => console.error(err));
```

Or for Pdf conversion

```js
var pdfConverter = new MarkdownElearnJS.PdfConverter();

// save as file
pdfConverter.toFile(markdown, filePath, rootPath).then((filename) => {
    console.log(filename);
}, err => console.error(err));

//get a buffer
pdfConverter.toBuffer(markdown, rootPath).then((buffer) => {
    // do something with the buffer
}, err => console.error(err));

// only the html if you want to use your own render framework
pdfConverter.toHtml(markdown).then((html) => {
    console.log(html);
}, err => console.error(err));
```

You can also use conversion options in each function call and specific
converter settings. Check the
[wiki pages](https://github.com/elb-min-uhh/markdown-elearnjs/wiki).

### Additional Features

The package does not only support the markdown conversion but also additional
features like _elearn.js extension detection_, _assets export_ and
_extraction of linked files_. For more information on this check the
[wiki pages](https://github.com/elb-min-uhh/markdown-elearnjs/wiki).

## Known Issues

* All platforms:
    * PDF output might be slow
        * consider keeping Chrome alive for multiple PDF exports (check settings)

## Credits

* [elearn.js](https://github.com/elb-min-uhh/elearn.js) based for output scripts and styles.
* [Showdown](http://showdownjs.com/) used for Markdown to HTML conversion.
* [Puppeteer](https://github.com/GoogleChrome/puppeteer)
used for HTML to PDF conversion.

## License

markdown-elearnjs is developed by
[dl.min](https://www.min.uni-hamburg.de/studium/digitalisierung-lehre/ueber-uns.html)
of Universität Hamburg.

The software is using [MIT-License](http://opensource.org/licenses/mit-license.php).

cc-by Michael Heinecke, Arne Westphal, dl.min, Universität Hamburg
