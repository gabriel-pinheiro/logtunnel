const json = require('./output-json');
const logfmt = require('./output-logfmt');
const mustache = require('./output-mustache');
const original = require('./output-original');
const unset = require('./output-unset');

module.exports = format => {
    switch(format?.toLowerCase()) {
        case     void 0: return unset();
        case     'json': return json();
        case   'logfmt': return logfmt();
        case 'original': return original();
        default:         return mustache(format);
    }
};
