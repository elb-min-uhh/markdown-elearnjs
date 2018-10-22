/**
 * Bundle all declaration files into one index.d.ts
 */

var dts = require('dts-bundle');

dts.bundle({
    name: 'markdown-elearnjs',
    main: __dirname + '/out/main.d.ts',
    out: __dirname + '/out/index.d.ts',
});
