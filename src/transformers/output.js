const Mustache = require('mustache');
Mustache.escape = text => text;

module.exports = format => line => {
    if(typeof line !== 'object') {
        throw new Error("To use an output transformer, you need to specify a parser like '-p json' ");
    }

    return Mustache.render(format, line);
};
