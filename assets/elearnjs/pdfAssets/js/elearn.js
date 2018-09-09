/**
* Basic script containing only necessary elements
*/

var eLearnJS = eLearnJS || {};

$(document).ready(function() {
    eLearnJS.createContentOverview();
    if(eLearnJS.selectedLocale === undefined) eLearnJS.setLanguage("de");
    else eLearnJS.setLanguage(eLearnJS.selectedLocale);
});

// -------------------------------------------------------------------------------------
// Overview
// -------------------------------------------------------------------------------------

// beinhaltet eine Liste alle bereits betrachteten Sections.
eLearnJS.sectionsVisited = [];

/**
* Erstellt ein Inhaltsverzeichnis. Wird #content-overview hinzugefügt.
*/
eLearnJS.createContentOverview = function() {
    if($('#content-overview').length > 0) {
        var text = "<ul>";
        var level = 0;
        var levels = {
            SUB: 1,
            SUBSUB: 2
        };

        for(var i = 0; i < $('section').length; i++) {

            var sec = $($('section')[i]);

            if(sec.is('.hide-in-overview')) continue;

            var sec_level = 0;
            if(sec.is('.sub')) sec_level = levels.SUB;
            if(sec.is('.subsub')) sec_level = levels.SUBSUB;

            if($('#content-overview').is('.kachel')) {
                // es kann nur eine ebenen zur zeit geöffnet werden
                // aufgrund der Schachtelung in li's einzige logische Variante
                if(level < sec_level) {
                    // ende des li zum schachteln entfernen
                    text = text.substring(0, text.length - 5);
                    text += "<ul>\r\n";
                    level++;
                }
                // mehrere ebenen können gleichzeitig beendet werden
                while(level > sec_level) {
                    text += "</ul></li>\r\n";
                    level--;
                }
            }
            // listenansicht
            else {
                // higher level
                while(level < sec_level) {
                    text += "<ul>";
                    level++;
                }
                // lower level
                while(level > sec_level) {
                    text += "</ul>";
                    level--;
                }
            }

            text += "<li onclick='overviewShowSection(" + i + "); event.stopPropagation();'>";

            text += "<div class='sectionRead'><div class='img'></div></div>";
            text += "<span class='title'>" + sec.attr('name') + "</span>";
            if(sec.attr('desc') != undefined
                && sec.attr('desc').length > 0) {
                text += "<p>" + sec.attr('desc') + "</p>";
            }

            text += "</li>";

            eLearnJS.sectionsVisited.push(false);
        }
        // close all open ul's
        while(level >= 0) {
            text += "</ul>";
            level--;
        }

        $('#content-overview').html(text);
        $('#content-overview').find('li').each(function(i, e) {
            if($(this).children('ul').length != 0) {
                $(this).addClass("wide");
            }
        });
        $('#content-overview').find("a").click(function(e) {
            e.preventDefault();
        });
    }
}

eLearnJS.selectedLocale = undefined;
eLearnJS.localization = {
    "de": {},
    "en": {},
}


/**
* Sets the language for all elements.
*/
eLearnJS.setLanguage = function(langCode) {
    langCode = langCode.toLowerCase();
    if(eLearnJS.localization[langCode] !== undefined) {
        eLearnJS.selectedLocale = langCode;
        $('[lang-code],[lang-code-title]').each(function(i, e) {
            eLearnJS.localizeElement($(e));
        });
    }
    else {
        throw "Unsupported language selected. Supported language codes are: " + Object.keys(eLearnJS.localization).toString();
    }
}
eLearnJS.selectLanguage = eLearnJS.setLanguage;

/**
* Localizes one specific element to match the selected language.
* The selected language is the eLearnJS.selectedLocale if not specific
* `lang` attribute is present in the HTML element
*/
eLearnJS.localizeElement = function(el, force) {
    if($(el).attr('localized') === "false" && !force) return;

    var loc = eLearnJS.selectedLocale;
    if(el.closest('[lang]').length) {
        var lang = el.closest('[lang]').attr('lang').toLowerCase();
        if(eLearnJS.localization[lang]) loc = lang;
    }

    if(el.attr("lang-code")) {
        var text = eLearnJS.localization[loc][el.attr("lang-code")];
        if(text) {
            if($(el).attr('localized') === "html") el.html(text);
            else el.text(text);
        }
    }

    if(el.attr("lang-code-title")) {
        var text = eLearnJS.localization[loc][el.attr("lang-code-title")];
        if(text) {
            el.attr('title', text);
        }
    }
};

/**
 * Adds custom localization keys to the storage.
 * @param {String} langCode The language to add keys to.
 * @param {Object} localeObject The localization object of type { key1: translation1, key2: ... }
 */
eLearnJS.addTranslation = function(langCode, localeObject) {
    if(eLearnJS.localization[langCode] != undefined) {
        eLearnJS.localization[langCode] = eLearnJS.objectAssign(eLearnJS.localization[langCode], localeObject);
    }
};

/**
 * Adds custom localization keys to the storage.
 * @param {*} localizationObject The localization object of type { langCode1: localeObject1, langCode2: ... }
 */
eLearnJS.addTranslations = function(localizationObject) {
    var langCodes = Object.keys(localizationObject);
    for(var i = 0; i < langCodes.length; i++) {
        eLearnJS.addTranslation(langCodes[i], localizationObject[langCodes[i]]);
    }
};

eLearnJS.objectAssign = function(obj1, obj2) {
    try {
        ret = Object.assign(obj1, obj2);
    }
    catch(e) {
        var objs = [obj1, obj2];
        ret = {};

        for(var objIdx = 0; objIdx < objs.length; objIdx++) {
            var obj = objs[objIdx];
            var keys = Object.keys(obj);
            for(var i = 0; i < keys.length; i++) {
                ret[keys[i]] = obj[keys[i]];
            }
        }
    }

    return ret;
};

// dummy functions to catch undefined errors
eLearnJS.toggleAllSections = function() { };
eLearnJS.setNavigationTitle = function() { };
eLearnJS.setBackButtonEnabled = function() { };
eLearnJS.setBackButtonText = function() { };
eLearnJS.setBackPage = function() { };

eLearnJS.generalDirectionButtonsEnabled = function() { };
eLearnJS.setKeyNavigationEnabled = function() { };
eLearnJS.generalProgressbarEnabled = function() { };
