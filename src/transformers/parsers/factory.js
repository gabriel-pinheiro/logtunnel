const { JsonParse } = require("./json");
const { LogfmtParse } = require("./logfmt");
const { TableParse } = require("./table");
const { RegexParse } = require("./regex");

function parseFactory(format) {
    switch(format?.toLowerCase()) {
        case   void 0: return null;
        case   'json': return new JsonParse();
        case 'logfmt': return new LogfmtParse();
        case  'table': return new TableParse();
        default:       return new RegexParse(format);
    }
}

module.exports = { parseFactory };
