"use strict";
/**
 * Clean Up directory before publish
 */

const fs = require('fs');

console.log("Removing old compilation files.");
fs.rmSync(__dirname + "/../out", { recursive: true, force: true });
