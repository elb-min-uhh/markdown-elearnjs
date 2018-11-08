"use strict";
/**
 * Clean Up directory before publish
 */

const rimraf = require('rimraf');

console.log("Removing old compilation files.");
rimraf(__dirname + "/../out", (err) => {
    if(err) console.log(err);
});
