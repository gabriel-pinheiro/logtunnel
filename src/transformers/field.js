const OPERATORS = {
    '=': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
    '~': (a, b) => a.includes(b),
};

module.exports = filter => {
    const regex = /^s*(?<field>[a-zA-Z0-9_-]+)\s*(?<operator>=|!=|>|<|>=|<=|~)\s*(?<value>.+)\s*$/.exec(filter);
    const { field, operator, value } = regex.groups;
    if(!field) {
        throw new Error('Invalid field filter, missing field');
    }
    if(!operator) {
        throw new Error('Invalid field filter, missing operator');
    }
    if(!value) {
        throw new Error('Invalid field filter, missing value');
    }

    let parsedValue;
    try {
        parsedValue = JSON.parse(value);
    } catch(e) {
        throw new Error('Invalid field filter, value is not a valid JSON field. Make sure to put strings between double quotes');
    }

    return line => {
        if(typeof line !== 'object') {
            throw new Error("To use a field filter, you need to specify a parser like '-p json' ");
        }

        return OPERATORS[operator](line[field], parsedValue);
    };
};
