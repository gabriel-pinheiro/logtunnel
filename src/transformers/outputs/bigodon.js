const { compile } = require('bigodon');

class BigodonOutput {
    constructor(template) {
        this.template = compile(template);
    }

    async run(line) {
        if (typeof line !== 'object') {
            throw new Error("To use an output transformer, you need to specify a parser like '-p json' ");
        }

        return this.template(line);
    }
}

module.exports = { BigodonOutput };
