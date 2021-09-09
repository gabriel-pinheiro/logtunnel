module.exports.definition = {
    h: {
        description: 'Show this screen',
        alias: 'help',
        type: 'help',
    },
    v: {
        description: 'Show the current version',
        alias: 'version',
        type: 'help',
    },
    f: {
        description: 'Show only logs that match the specified regex',
        alias: 'filter',
        type: 'string',
        multiple: true,
    },
    i: {
        description: 'Ignore logs that match the specified regex',
        alias: 'ignore',
        type: 'string',
        multiple: true,
    },
    p: {
        description: 'Parses the input using this modifier. Allowed: json, logfmt or <regex>',
        alias: 'parse-input',
        type: 'string',
    },
    o: {
        description: 'Formats the output using the specified mustache template',
        alias: 'output',
        type: 'string',
    },
};
