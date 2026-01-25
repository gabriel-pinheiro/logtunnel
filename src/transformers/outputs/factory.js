const { JsonOutput } = require('./json');
const { LogfmtOutput } = require('./logfmt');
const { BigodonOutput } = require('./bigodon');
const { OriginalOutput } = require('./original');
const { InspectOutput } = require('./inspect');
const { TableOutput } = require('./table');


function outputFactory(format) {
    switch(format?.toLowerCase()) {
        case  undefined: return new InspectOutput(false);
        case     'json': return new JsonOutput();
        case    'table': return new TableOutput();
        case   'logfmt': return new LogfmtOutput();
        case  'inspect': return new InspectOutput(true);
        case 'original': return new OriginalOutput();
        default:         return new BigodonOutput(format);
    }
}

module.exports = { outputFactory };
