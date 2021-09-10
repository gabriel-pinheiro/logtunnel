const vm = require('vm');

module.exports = filter => {
    return line => {
        if(typeof line !== 'object') {
            throw new Error("To use a field filter, you need to specify a parser like '-p json' ");
        }

        vm.createContext(line);
        const result = vm.runInContext(filter, line);
        return Boolean(result);
    };
};
