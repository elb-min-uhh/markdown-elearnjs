"use strict";

import Showdown, { FilterExtension, ListenerExtension } from 'showdown';

/**
 * Creates Showdown extensions for elearnjs markdown conversion.
 */
export class ShowdownExtensionManager {
    // regular expressions
    private static readonly indentionRegExp = /(?:^|\n)([ \t]*)(?!(?:\n|$))/g;

    // original markdown
    private static readonly inlineHeadingRegExp = /^(#{1,6})(?!#)(?!<!--no-section-->)[ \t]*(.+?)[ \t]*#*$/gm;

    // general html
    private static readonly commentRegExp = /[ \t]*<!---*?\s*?[\s\S]*?--+>/g;

    // elearn.js syntax extensions
    private static readonly sectionRegExp = /(\|{3,5})(?!\|)((?:\\\||(?!\1).)*?)\1(.*)\n/g;
    private static readonly firstSectionRegExp = new RegExp(ShowdownExtensionManager.sectionRegExp, "");
    private static readonly imprintRegExp = /(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n--+>)/;
    private static readonly metaBlockRegExp = /(?:(?:^|\n)(---+)\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)meta\n([\s\S]*?)\n--+>)/;
    private static readonly metaBlockElementsRegExp = /(?:(?:^|\n)[ \t]*(\w+)\s*:\s*(["'`])((?:\\\2|(?!\2)[\s\S])*?)\2|(?:^|\n)[ \t]*(\w+)\s*:\s*([^\n]*))/g;

    // elearn.js additional comments
    private static readonly hideInOverviewRegExp = /\s*<!--hide-in-overview-->/g;
    private static readonly noSectionRegExp = /\s*<!--no-section-->/g;
    private static readonly secDescriptionRegExp = /[ \t]*<!--desc[ \t]+(.*?)[ \t]*-->/g;
    private static readonly secDescriptionReplacementRegExp = /desc="elearnjs-section-description-(\d+)"/g;
    private static readonly hiddenCommentRegExp = /[ \t]*<!--hide\s+?[\s\S]*?--+>/g;

    private descriptions: { [key: number]: string } = {};
    private descriptionIndex = 0;

    /**
     * Add the section syntax for new sections before headings.
     */
    private addSectionOnHeading: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            const headingDepth = converter.getOption('headingDepth');

            const useSubSections = converter.getOption('useSubSections');
            const subSection = converter.getOption('subSectionLevel');
            const subSubSection = converter.getOption('subsubSectionLevel');

            // parse headings
            if(converter.getOption('newSectionOnHeading')) {
                const match = text.match(ShowdownExtensionManager.inlineHeadingRegExp);
                if(match && match.length) {
                    text = text.replace(ShowdownExtensionManager.inlineHeadingRegExp, (wholeMatch, type, content) => {
                        content = content.trim();
                        let ret = `${type}<!--no-section-->${content}`;
                        if(type.length <= headingDepth
                            && content.indexOf(`<!--no-section-->`) < 0) {

                            let hideInOverview = content.indexOf(`<!--hide-in-overview-->`) >= 0 ? '<!--hide-in-overview-->' : '';
                            content = content.replace(ShowdownExtensionManager.hideInOverviewRegExp, "");
                            let description = content.match(ShowdownExtensionManager.secDescriptionRegExp);
                            content = content.replace(ShowdownExtensionManager.secDescriptionRegExp, "");

                            description = description && description.length ? description[0].trim() : "";

                            // default section
                            if(!useSubSections
                                || type.length < subSection) {
                                ret = `|||${ShowdownExtensionManager.escapeSectionName(content)}|||${hideInOverview}${description}\n` + ret;
                            }
                            else if(type.length < subSubSection) {
                                ret = `||||${ShowdownExtensionManager.escapeSectionName(content)}||||${hideInOverview}${description}\n` + ret;
                            }
                            else {
                                ret = `|||||${ShowdownExtensionManager.escapeSectionName(content)}|||||${hideInOverview}${description}\n` + ret;
                            }
                        }
                        return ret;
                    });
                }
            }
            return text;
        },
    };

    /**
     * Replace the section syntax with actual HTML.
     */
    private readonly replaceSectionSyntax: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            const conv = converter;
            // clear descriptions, this will be used for replacement of descr. tags
            let match = text.match(ShowdownExtensionManager.firstSectionRegExp);
            if(match && match.length) {
                // replace only first
                text = text.replace(ShowdownExtensionManager.firstSectionRegExp, (wholeMatch, wrap, heading, addition) => {
                    return this.parseSection(conv, wholeMatch, wrap, heading, addition);
                });
                // replace all following
                text = text.replace(ShowdownExtensionManager.sectionRegExp, (wholeMatch, wrap, heading, addition) => {
                    return `\n</section>\n${this.parseSection(conv, wholeMatch, wrap, heading, addition)}`;
                });
                text += "\n</section>\n";
            }

            return text;
        },
    };

    /**
     * Replace the section syntax with actual HTML. Might add a page break
     * additionally if activated.
     */
    private readonly pdfSectionSyntax: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            const conv = converter;
            let replacement = converter.getOption('newPageOnSection') ? '<div style="page-break-before: always;"></div>\n' : '';

            let match = text.match(ShowdownExtensionManager.firstSectionRegExp);
            if(match && match.length) {
                // replace only first
                text = text.replace(ShowdownExtensionManager.firstSectionRegExp, (wholeMatch, wrap, heading, addition) => {
                    return this.parseSection(conv, wholeMatch, wrap, heading, addition);
                });
                // replace all following
                text = text.replace(ShowdownExtensionManager.sectionRegExp, (wholeMatch, wrap, heading, addition) => {
                    return `\n</section>\n${replacement}${this.parseSection(conv, wholeMatch, wrap, heading, addition)}`;
                });
                text += "\n</section>\n";
            }
            return text;
        },
    };

    /**
     * Insert stored descriptions back into the code.
     */
    private readonly insertSectionDescription: FilterExtension = {
        type: 'output',
        filter: (text: string, converter: Showdown.Converter) => {
            text = text.replace(ShowdownExtensionManager.secDescriptionReplacementRegExp,
                (wholeMatch, index) => {
                    let desc = this.descriptions && this.descriptions[index] ? `desc="${this.descriptions[index]}"` : '';
                    delete this.descriptions[index];
                    return desc;
                });
            return text;
        },
    };

    /**
     * Remove the meta block from the code.
     */
    private readonly removeMetaBlock: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            let match = text.match(ShowdownExtensionManager.metaBlockRegExp);
            if(match && match.length) {
                text = text.replace(/\r/g, "").replace(ShowdownExtensionManager.metaBlockRegExp, () => {
                    return "";
                });
            }
            return text;
        },
    };

    /**
     * Parse the imprints Markdown.
     */
    private readonly parseImprint: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            text = text.replace(/\r/g, "");
            let imprint = text;
            text.replace(ShowdownExtensionManager.imprintRegExp, (wholeMatch, delim1, codeblock1, delim2, codeblock2) => {
                let code = delim1 ? codeblock1 : (delim2 ? codeblock2 : undefined);
                if(!code) return "";

                // remove indention up to 4 spaces (1 tab)
                let shortestIndention = code.replace(/(^|\n)\t/g, "$1    ")
                    .match(ShowdownExtensionManager.indentionRegExp)
                    .reduce((minIndent: number, match: string) => {
                        return Math.min(minIndent, match.replace(/\n/g, "").length);
                    }, 4);
                code = ShowdownExtensionManager.removeIndention(code, shortestIndention, 4);

                imprint = converter.makeHtml(code);
                return "";
            });
            return imprint;
        },
    };

    /**
     * Remove the imprint block from the code.
     */
    private readonly removeImprintBlock: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            text = text.replace(/\r/g, "").replace(ShowdownExtensionManager.imprintRegExp, (wholeMatch, delim, content) => {
                return "";
            });
            return text;
        },
    };

    /**
     * Remove the `no-section` comment.
     */
    private readonly cleanNoSectionComment: ListenerExtension = {
        type: 'listener',
        listeners: {
            'headers.before': (event: any, text: string, options: any, globals: any) => {
                text = text.replace(ShowdownExtensionManager.noSectionRegExp, "");
                return text;
            },
        },
    };

    /**
     * Remove the `hide-in-overview` comment.
     */
    private readonly cleanHideInOverviewComment: ListenerExtension = {
        type: 'listener',
        listeners: {
            'headers.before': (event: any, text: string, options: any, globals: any) => {
                text = text.replace(ShowdownExtensionManager.hideInOverviewRegExp, "");
                return text;
            },
        },
    };

    /**
     * Remove the `desc` comment.
     */
    private readonly cleanSectionDescriptionComment: ListenerExtension = {
        type: 'listener',
        listeners: {
            'headers.before': (event: any, text: string, options: any, globals: any) => {
                text = text.replace(ShowdownExtensionManager.secDescriptionRegExp, "");
                return text;
            },
        },
    };

    /**
     * Remove empty paragraphs from the output.
     */
    private readonly cleanEmptyParagraphs: FilterExtension = {
        type: 'output',
        filter: (text: string, converter: Showdown.Converter) => {
            let cleanBefore = ['div', 'iframe'];
            text = text.replace(/<p><\/p>/g, "");

            for(let element of cleanBefore) {
                let regBefore = new RegExp(`<p><${element}`, "g");
                let regAfter = new RegExp(`</${element}></p>`, "g");
                text = text.replace(regBefore, `<${element}`)
                    .replace(regAfter, `</${element}>`);
            }

            return text;
        },
    };

    /**
     * Remove the markdown="X" HTML attribute.
     */
    private readonly cleanMarkdownAttribute: FilterExtension = {
        type: 'output',
        filter: (text: string, converter: Showdown.Converter) => {
            // check for HTML elements containing a markdown attribute
            let markdownAttributeRegExp = /<(\S+)((?:[ \t]+(?!markdown[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\3|(?!\3).)*\3)*)([ \t]+markdown[ \t]*=[ \t]*(["'])(?:\\\5|(?!\5).)*\5)([^>]*)>/gi;
            return text.replace(markdownAttributeRegExp,
                (wholeMatch, tag, before, wrapBefore, attr, wrap, after, closingSlash) => {
                    // remove the attribute
                    return wholeMatch.replace(attr, "");
                });
        },
    };

    /**
     * Remove hidden comments.
     */
    private readonly cleanHiddenComments: FilterExtension = {
        type: 'lang',
        filter: (text: string, converter: Showdown.Converter) => {
            return text.replace(ShowdownExtensionManager.hiddenCommentRegExp, "");
        },
    };

    /**
     * Remove all HTML comments.
     */
    private readonly cleanHtmlComments: FilterExtension = {
        type: 'output',
        filter: (text: string, converter: Showdown.Converter) => {
            if(converter.getOption('removeComments')) {
                text = text.replace(ShowdownExtensionManager.commentRegExp, "");
            }
            return text;
        },
    };

    private static escapeSectionName(name: string) {
        // there should be no single \, since they have to be escaped in markdown
        return name.replace(/\|/g, "\\|");
    }
    private static unescapeSectionName(name: string) {
        // unescape \\ needs to be done everywhere when interpreting markdown code
        return name.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
    }
    private static escapeHTMLQuotes(text: string) {
        return text.replace(/"/g, "&quot;");
    }
    private static removeMarkdownSyntax(text: string, converter: Showdown.Converter) {
        return converter.makeHtml(text).replace(/<.*?>/g, "");
    }

    /**
     * Removes up to @param indentionSize spaces (or tabs if tabsize <= indentionSize)
     * from the beginning of each line.
     */
    private static removeIndention(block: string, indentionSize: number, tabSize: number) {
        if(indentionSize === 0) return block;
        if(indentionSize === undefined) indentionSize = 4;
        if(tabSize === undefined) tabSize = 4;
        let tabsRemoved = Math.floor(indentionSize / tabSize);
        let spaceRegExp = new RegExp(`(^|\n)([ ]{1,${indentionSize}}${tabsRemoved > 0 ? `|\\t{1,${tabsRemoved}}` : ""})`, "g");
        return block.replace(spaceRegExp, (wholeMatch, lineBreak, indention) => {
            return lineBreak;
        });
    }

    /**
     * Create a meta element based on the parameters.
     * @param tag the HTML tag.
     * @param value the value to set it to.
     * @param valueSurrounding the value surrounding (to be able to unescape)
     */
    private static createMeta(tag: string, value: string, valueSurrounding: string) {
        // unescape
        if(valueSurrounding) {
            let regex = new RegExp("\\\\" + valueSurrounding, "g");
            value = value.replace(regex, valueSurrounding);
        }
        if(tag.toLowerCase() === "title") {
            return `<title>${value}</title>`;
        }
        if(tag.toLowerCase() === "custom") {
            // value unescaped
            return value;
        }
        else {
            return `<meta name="${tag.toLowerCase()}" content="${ShowdownExtensionManager.escapeHTMLQuotes(value)}"/>`;
        }
    }

    /**
     * Get all extensions used for the HTML body conversion.
     */
    public getHtmlBodyExtensions() {
        // do nothing
        const self = this;
        return [
            self.addSectionOnHeading,
            self.cleanNoSectionComment,
            self.cleanHideInOverviewComment,
            self.cleanSectionDescriptionComment,
            self.cleanHiddenComments,
            self.replaceSectionSyntax,
            self.insertSectionDescription,
            self.removeMetaBlock,
            self.removeImprintBlock,
            self.cleanEmptyParagraphs,
            self.cleanMarkdownAttribute,
            self.cleanHtmlComments,
        ];
    }

    /**
     * Get all extensions used for the PDF body conversion.
     */
    public getPdfBodyExtensions() {
        // do nothing
        const self = this;
        return [
            self.addSectionOnHeading,
            self.cleanNoSectionComment,
            self.cleanHideInOverviewComment,
            self.cleanSectionDescriptionComment,
            self.cleanHiddenComments,
            self.pdfSectionSyntax,
            self.insertSectionDescription,
            self.removeMetaBlock,
            self.removeImprintBlock,
            self.cleanEmptyParagraphs,
            self.cleanMarkdownAttribute,
            self.cleanHtmlComments,
        ];
    }

    /**
     * Get all extensions used for the imprint conversion.
     */
    public getImprintExtensions() {
        // do nothing
        const self = this;
        return [
            self.parseImprint,
            self.cleanHiddenComments,
            self.cleanHtmlComments,
        ];
    }

    /**
     * Parse the meta data, to create all meta elements.
     * @param text the meta content.
     */
    public parseMetaData(text: string) {
        let meta = "";
        text = text.replace(/\r/g, "");
        text.replace(ShowdownExtensionManager.metaBlockRegExp, (wholeMatch: string, delim1: string, content1: string, delim2: string, content2: string) => {
            let content = delim1 ? content1 : (delim2 ? content2 : "");
            // 2 options: Key: ["'`]MULTILINE_VALUE["'`] or Key: VALUE
            meta = content.replace(ShowdownExtensionManager.metaBlockElementsRegExp, (wm, tag1, valueSurrounding, value1, tag2, value2) => {
                // ignore escaped endings
                if(wholeMatch.match(/^(\w+)\s*:\s*(["'`])([\s\S]*?)\\\2$/)) return wholeMatch;

                if(tag1) return ShowdownExtensionManager.createMeta(tag1, value1, valueSurrounding);
                else if(tag2) return ShowdownExtensionManager.createMeta(tag2, value2, valueSurrounding);
                return "";
            });
            return "";
        });
        return meta;
    }

    /**
     * Parse the code for section syntax.
     * @param converter the converter used to convert descriptions.
     * @param wholeMatch the whole section syntax (with additional comments if set)
     * @param wrap the wrapping char
     * @param heading the actual heading content
     * @param addition additional text, e.g. comments
     */
    private parseSection(converter: Showdown.Converter, wholeMatch: string, wrap: string, heading: string, addition: string) {
        let size = wrap.length;
        heading = ShowdownExtensionManager.unescapeSectionName(heading);
        // make html to eval markdown syntax, remove created HTML elements then
        // assume < > as escaped chars &lt; and &gt; when not marking an html element
        heading = ShowdownExtensionManager.removeMarkdownSyntax(heading, converter);
        heading = ShowdownExtensionManager.escapeHTMLQuotes(heading);

        // check for sub or subsubsection
        let sub = '';
        for(let i = 3; i < size; i++) sub += 'sub';
        // check for hide in overview
        let hide = '';
        if(addition.indexOf(`<!--hide-in-overview-->`) >= 0) hide = "hide-in-overview";
        // set class attribute
        let clazz = sub || hide ? ` class="${sub}${sub && hide ? ' ' : ''}${hide}"` : '';

        // check descriptions
        let desc = '';
        if(addition.match(ShowdownExtensionManager.secDescriptionRegExp)) {
            let descriptionContent = '';
            addition.replace(ShowdownExtensionManager.secDescriptionRegExp, (wm, content) => {
                descriptionContent = content;
                return '';
            });
            desc = ` desc="elearnjs-section-description-${this.descriptionIndex}"`;
            this.descriptions[this.descriptionIndex] = converter.makeHtml(
                ShowdownExtensionManager.escapeHTMLQuotes(descriptionContent)).replace(/^<p>/g, "").replace(/<\/p>$/g, "");
            this.descriptionIndex++;
        }

        return `\n<section markdown="1" name="${heading}"${clazz}${desc}>\n`;
    }
}
