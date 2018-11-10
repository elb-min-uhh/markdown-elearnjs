"use strict";

module.exports = {
    out: __dirname + '/../docs/',

    readme: 'none',
    includes: __dirname + '/../src/',
    exclude: [
        '**/test/**/*',
        '**.test.ts',
    ],
    mode: 'file',
    excludeExternals: true,
    excludeNotExported: true,
    excludePrivate: true
};
