const { JsonOutput } = require('./json');
const { LogfmtOutput } = require('./logfmt');
const { BigodonOutput } = require('./bigodon');
const { OriginalOutput } = require('./original');
const { InspectOutput } = require('./inspect');


function outputFactory(format) {
    switch(format?.toLowerCase()) {
        case  undefined: return new InspectOutput(false);
        case  'inspect': return new InspectOutput(true);
        case     'json': return new JsonOutput();
        case   'logfmt': return new LogfmtOutput();
        case 'original': return new OriginalOutput();
        default:         return new BigodonOutput(format);
    }
}

module.exports = { outputFactory };
