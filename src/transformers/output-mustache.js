const { compile } = require('jstache');

module.exports = format => {
    const template = compile(format);

    return line => {
        if(typeof line !== 'object') {
            throw new Error("To use an output transformer, you need to specify a parser like '-p json' ");
        }

        return template(line);
    };
}
