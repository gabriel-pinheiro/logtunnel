const { compileExpression } = require('bigodon');

module.exports = filter => {
    const expression = compileExpression(filter);

    return async line => {
        if(typeof line !== 'object') {
            throw new Error("To use a field filter, you need to specify a parser like '-p json' ");
        }

        const result = await expression(line);
        return Boolean(result);
    };
};
