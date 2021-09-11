const util = require('util');

module.exports = () => line => {
    if(typeof line === 'string') {
        return true;
    }

    return util.inspect({ ...line }, {
        colors: true,
        depth: null,
    });
};
