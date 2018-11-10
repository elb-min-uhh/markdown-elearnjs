"use strict";

/**
 * Clean Up directory before publish
 */

const fs = require('fs');
const path = require('path');


// remove all absolute paths from the docs
let docs = path.join(__dirname, "..", "docs");
console.log("Removing `__dirname` from package.json in node_modules");
directoryCleanEverything(docs, "\\.html", path.join(__dirname, "..").replace(/\\/g, "/"));

/**
 * Removes the `toRemove` string from every package.json found in the subtree
 * @param {*} dirPath the parent dir
 */
function directoryCleanEverything(dirPath, includeExtension, toRemove, replacement) {
    if(!fs.existsSync(dirPath)) return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    // try cleaning package.json in current dir
    if(!isDirectory && dirPath.match(new RegExp(includeExtension + "$", "g"))) {
        let content = fs.readFileSync(dirPath).toString();
        while(content.indexOf(toRemove) >= 0) {
            content = content.replace(toRemove, replacement || "");
        }
        fs.writeFileSync(dirPath, content);
    }
    else if(isDirectory) {
        // check for subdirectories
        let list = fs.readdirSync(dirPath);
        for(let dir of list) {
            let subDirPath = dirPath + "/" + dir;
            directoryCleanEverything(subDirPath, includeExtension, toRemove, replacement);
        }
    }
}
