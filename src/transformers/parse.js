const json = require('./parse-json');
const logfmt = require('./parse-logfmt');
const regex = require('./parse-regex');
const table = require('./parse-table');

module.exports = format => {
    switch(format?.toLowerCase()) {
        case   void 0: return null;
        case   'json': return json();
        case 'logfmt': return logfmt();
        case  'table': return table();
        default:       return regex(format);
    }
};
