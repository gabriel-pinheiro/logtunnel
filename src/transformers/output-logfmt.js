const logfmt = require('logfmt');

module.exports = () => line => {
    if(typeof line !== 'object') {
        throw new Error("To use an output transformer, you need to specify a parser like '-p json'");
    }

    return logfmt.stringify(line);
};
