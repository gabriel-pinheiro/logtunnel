const Mustache = require('mustache');
Mustache.escape = text => text;

module.exports = () => (_line, original) => {
    return original;
};
