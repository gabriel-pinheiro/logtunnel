const json = require('./output-json');
const logfmt = require('./output-logfmt');
const mustache = require('./output-mustache');
const original = require('./output-original');
const inspect = require('./output-inspect');

module.exports = format => {
    switch(format?.toLowerCase()) {
        case  undefined: return inspect(false);
        case  'inspect': return inspect(true);
        case     'json': return json();
        case   'logfmt': return logfmt();
        case 'original': return original();
        default:         return mustache(format);
    }
};
