const util = require('util');

module.exports = (breakLines = false) => {
    const options = {
        colors: true,
        depth: null,
        breakLength: breakLines ? 80 : Infinity,
        compact: !breakLines,
    };

    return line => {
        if(typeof line === 'string') {
            return true;
        }

        return util.inspect(line, options);
    };
};
