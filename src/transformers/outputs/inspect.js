const util = require('util');

class InspectOutput {
    constructor(breakLines = false) {
        this.options = {
            colors: true,
            depth: null,
            breakLength: breakLines ? 80 : Infinity,
            compact: !breakLines,
        };
    }

    run(line) {
        if (typeof line === 'string') {
            return true;
        }

        return util.inspect({ ...line }, this.options);
    }
}

module.exports = { InspectOutput };
