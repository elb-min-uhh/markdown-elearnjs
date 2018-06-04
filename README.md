# markdown-elearnjs
Simple markdown conversion to elearn.js based HTML and PDF.

## Installation

Use the following

    npm install --save markdown-elearnjs

## Usage

_coming soon_

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
