"use strict";

import Showdown, { FilterExtension, ListenerExtension } from 'showdown';

// regular expressions
const indentionRegExp = /(?:^|\n)([ \t]*)(?!(?:\n|$))/g;

// original markdown
const inlineHeadingRegExp = /^(#{1,6})(?!#)(?!<!--no-section-->)[ \t]*(.+?)[ \t]*#*$/gm;

// elearn.js syntax extensions
const sectionRegExp = /(\|{3,5})(?!\|)((?:\\\||(?!\1).)*?)\1(.*)\n/g;
const firstSectionRegExp = new RegExp(sectionRegExp, "");
const imprintRegExp = /(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n--+>)/;
const metaBlockRegExp = /(?:(?:^|\n)(---+)\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)meta\n([\s\S]*?)\n--+>)/;
const metaBlockElementsRegExp = /(?:(?:^|\n)[ \t]*(\w+)\s*:\s*(["'`])((?:\\\2|(?!\2)[\s\S])*?)\2|(?:^|\n)[ \t]*(\w+)\s*:\s*([^\n]*))/g;

// elearn.js additional comments
const hideInOverviewRegExp = /\s*<!--hide-in-overview-->/g;
const noSectionRegExp = /\s*<!--no-section-->/g;
const secDescriptionRegExp = /[ \t]*<!--desc[ \t]+(.*?)[ \t]*-->/g;
const secDescriptionReplacementRegExp = /desc="elearnjs-section-description-(\d+)"/g;

const escapeSectionName = (name: string) => {
    // there should be no single \, since they have to be escaped in markdown
    return name.replace(/\|/g, "\\|");
};
const unescapeSectionName = (name: string) => {
    // unescape \\ needs to be done everywhere when interpreting markdown code
    return name.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
};
const escapeHTMLQuotes = (text: string) => {
    return text.replace(/"/g, "&quot;");
};
const removeMarkdownSyntax = (text: string, converter: Showdown.Converter) => {
    return converter.makeHtml(text).replace(/<.*?>/g, "");
};

const descriptions: { [key: number]: string } = {};
let descrIndex = 0;


const addSectionOnHeading: FilterExtension = {
    type: 'lang',
    filter: (text: string, converter: Showdown.Converter) => {
        const headingDepth = converter.getOption('headingDepth');

        const useSubSections = converter.getOption('useSubSections');
        const subSection = converter.getOption('subSectionLevel');
        const subSubSection = converter.getOption('subsubSectionLevel');

        // parse headings
        if(converter.getOption('newSectionOnHeading')) {
            const match = text.match(inlineHeadingRegExp);
            if(match && match.length) {
                text = text.replace(inlineHeadingRegExp, (wholeMatch, type, content) => {
                    content = content.trim();
                    let ret = `${type}<!--no-section-->${content}`;
                    if(type.length <= headingDepth
                        && content.indexOf(`<!--no-section-->`) < 0) {

                        let hideInOverview = content.indexOf(`<!--hide-in-overview-->`) >= 0 ? '<!--hide-in-overview-->' : '';
                        content = content.replace(hideInOverviewRegExp, "");
                        let description = content.match(secDescriptionRegExp);
                        content = content.replace(secDescriptionRegExp, "");

                        description = description && description.length ? description[0].trim() : "";

                        // default section
                        if(!useSubSections
                            || type.length < subSection) {
                            ret = `|||${escapeSectionName(content)}|||${hideInOverview}${description}\n` + ret;
                        }
                        else if(type.length < subSubSection) {
                            ret = `||||${escapeSectionName(content)}||||${hideInOverview}${description}\n` + ret;
                        }
                        else {
                            ret = `|||||${escapeSectionName(content)}|||||${hideInOverview}${description}\n` + ret;
                        }
                    }
                    return ret;
                });
            }
        }
        return text;
    },
};

const replaceSectionSyntax: FilterExtension = {
    type: 'lang',
    filter: (text: string, converter: Showdown.Converter) => {
        const conv = converter;
        // clear descriptions, this will be used for replacement of descr. tags
        let match = text.match(firstSectionRegExp);
        if(match && match.length) {
            // replace only first
            text = text.replace(firstSectionRegExp, (wholeMatch, wrap, heading, addition) => {
                return parseSection(conv, wholeMatch, wrap, heading, addition);
            });
            // replace all following
            text = text.replace(sectionRegExp, (wholeMatch, wrap, heading, addition) => {
                return `</section>${parseSection(conv, wholeMatch, wrap, heading, addition)}`;
            });
            text += "</section>";
        }

        return text;
    },
};

const pdfSectionSyntax: FilterExtension = {
    type: 'lang',
    filter: (text: string, converter: Showdown.Converter) => {
        const conv = converter;
        let replacement = converter.getOption('newPageOnSection') ? '<div style="page-break-before: always;">' : '';

        let match = text.match(firstSectionRegExp);
        if(match && match.length) {
            // replace only first
            text = text.replace(firstSectionRegExp, (wholeMatch, wrap, heading, addition) => {
                return parseSection(conv, wholeMatch, wrap, heading, addition);
            });
            // replace all following
            text = text.replace(sectionRegExp, (wholeMatch, wrap, heading, addition) => {
                return `</section>${replacement}${parseSection(conv, wholeMatch, wrap, heading, addition)}`;
            });
            text += "</section>";
        }

        return text;
    },
};

const insertSectionDescription: FilterExtension = {
    type: 'output',
    filter: (text: string, converter: Showdown.Converter) => {
        text = text.replace(secDescriptionReplacementRegExp,
            (wholeMatch, index) => {
                let desc = descriptions && descriptions[index] ? `desc="${descriptions[index]}"` : '';
                delete descriptions[index];
                return desc;
            });
        return text;
    },
};

const removeMetaBlock: FilterExtension = {
    type: 'lang',
    filter: (text: string, converter: Showdown.Converter) => {
        let match = text.match(metaBlockRegExp);
        if(match && match.length) {
            text = text.replace(/\r/g, "").replace(metaBlockRegExp, () => {
                return "";
            });
        }
        return text;
    },
};

const parseImprint: FilterExtension = {
    type: 'lang',
    filter: (text: string, converter: Showdown.Converter) => {
        text = text.replace(/\r/g, "");
        let imprint = text;
        text.replace(imprintRegExp, (wholeMatch, delim1, codeblock1, delim2, codeblock2) => {
            let code = delim1 ? codeblock1 : (delim2 ? codeblock2 : undefined);
            if(!code) return "";

            // remove indention up to 4 spaces (1 tab)
            let shortestIndention = code.replace(/(^|\n)\t/g, "$1    ")
                .match(indentionRegExp)
                .reduce((minIndent: number, match: string) => {
                    return Math.min(minIndent, match.replace(/\n/g, "").length);
                }, 4);
            code = removeIndention(code, shortestIndention, 4);

            imprint = converter.makeHtml(code);
            return "";
        });
        return imprint;
    },
};

const removeImprintBlock: FilterExtension = {
    type: 'lang',
    filter: (text: string, converter: Showdown.Converter) => {
        text = text.replace(/\r/g, "").replace(imprintRegExp, (wholeMatch, delim, content) => {
            return "";
        });
        return text;
    },
};

const cleanNoSectionComment: ListenerExtension = {
    type: 'listener',
    listeners: {
        'headers.before': (event: any, text: string, options: any, globals: any) => {
            text = text.replace(noSectionRegExp, "");
            return text;
        },
    },
};

const cleanHideInOverviewComment: ListenerExtension = {
    type: 'listener',
    listeners: {
        'headers.before': (event: any, text: string, options: any, globals: any) => {
            text = text.replace(hideInOverviewRegExp, "");
            return text;
        },
    },
};

const cleanSectionDescriptionComment: ListenerExtension = {
    type: 'listener',
    listeners: {
        'headers.before': (event: any, text: string, options: any, globals: any) => {
            text = text.replace(secDescriptionRegExp, "");
            return text;
        },
    },
};

const cleanEmptyParagraphs: FilterExtension = {
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

const cleanMarkdownAttribute: FilterExtension = {
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

const elearnHtmlBody = () => {
    return [
        addSectionOnHeading,
        cleanNoSectionComment,
        cleanHideInOverviewComment,
        cleanSectionDescriptionComment,
        replaceSectionSyntax,
        insertSectionDescription,
        removeMetaBlock,
        removeImprintBlock,
        cleanEmptyParagraphs,
        cleanMarkdownAttribute,
    ];
};

const elearnPdfBody = () => {
    return [
        addSectionOnHeading,
        cleanNoSectionComment,
        cleanHideInOverviewComment,
        cleanSectionDescriptionComment,
        pdfSectionSyntax,
        insertSectionDescription,
        removeMetaBlock,
        removeImprintBlock,
        cleanEmptyParagraphs,
        cleanMarkdownAttribute,
    ];
};

const elearnImprint = () => {
    return [parseImprint];
};

const parseSection = (converter: Showdown.Converter, wholeMatch: string, wrap: string, heading: string, addition: string) => {
    let size = wrap.length;
    heading = unescapeSectionName(heading);
    // make html to eval markdown syntax, remove created HTML elements then
    // assume < > as escaped chars &lt; and &gt; when not marking an html element
    heading = removeMarkdownSyntax(heading, converter);
    heading = escapeHTMLQuotes(heading);

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
    if(addition.match(secDescriptionRegExp)) {
        let descriptionContent = '';
        addition.replace(secDescriptionRegExp, (wm, content) => {
            descriptionContent = content;
            return '';
        });
        desc = ` desc="elearnjs-section-description-${descrIndex}"`;
        descriptions[descrIndex] = converter.makeHtml(escapeHTMLQuotes(descriptionContent)).replace(/^<p>/g, "").replace(/<\/p>$/g, "");
        descrIndex++;
    }

    return `<section markdown="1" name="${heading}"${clazz}${desc}>\n`;
};

const parseMetaData = (text: string) => {
    let meta = "";
    text = text.replace(/\r/g, "");
    text.replace(metaBlockRegExp, (wholeMatch: string, delim1: string, content1: string, delim2: string, content2: string) => {
        let content = delim1 ? content1 : (delim2 ? content2 : "");
        // 2 options: Key: ["'`]MULTILINE_VALUE["'`] or Key: VALUE
        meta = content.replace(metaBlockElementsRegExp, (wm, tag1, valueSurrounding, value1, tag2, value2) => {
            // ignore escaped endings
            if(wholeMatch.match(/^(\w+)\s*:\s*(["'`])([\s\S]*?)\\\2$/)) return wholeMatch;

            if(tag1) return createMeta(tag1, value1, valueSurrounding);
            else if(tag2) return createMeta(tag2, value2, valueSurrounding);
            return "";
        });
        return "";
    });
    return meta;
};

const createMeta = (tag: string, value: string, valueSurrounding: string) => {
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
        return `<meta name="${tag.toLowerCase()}" content="${escapeHTMLQuotes(value)}"/>`;
    }
};

/**
 * Removes up to @param indentionSize spaces (or tabs if tabsize <= indentionSize)
 * from the beginning of each line.
 */
const removeIndention = (block: string, indentionSize: number, tabSize: number) => {
    if(indentionSize === 0) return block;
    if(indentionSize === undefined) indentionSize = 4;
    if(tabSize === undefined) tabSize = 4;
    let tabsRemoved = Math.floor(indentionSize / tabSize);
    let spaceRegExp = new RegExp(`(^|\n)([ ]{1,${indentionSize}}${tabsRemoved > 0 ? `|\\t{1,${tabsRemoved}}` : ""})`, "g");
    return block.replace(spaceRegExp, (wholeMatch, lineBreak, indention) => {
        return lineBreak;
    });
};

export { elearnHtmlBody };
export { elearnPdfBody };
export { elearnImprint };
export { parseMetaData };
