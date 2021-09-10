const util = require('util');

module.exports = () => line => {
    if(typeof line === 'string') {
        return line;
    }

    return util.inspect({ ...line }, {
        colors: true,
        depth: null,
    });
};
