const { compileExpression } = require('bigodon');

class FieldFilter {
    constructor(expression) {
        this.expression = compileExpression(expression);
    }

    async run(line) {
        if(typeof line !== 'object') {
            throw new Error("To use a field filter, you need to specify a parser like '-p json' ");
        }

        const result = await this.expression(line);
        return Boolean(result);
    }
}

module.exports = { FieldFilter };
