const util = require('util');

module.exports = () => line => {
    if(typeof line === 'string') {
        return line;
    }

    return util.inspect(output, {
        colors: true,
        depth: null,
    });
};
