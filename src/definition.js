const Bossy = require('@hapi/bossy');

const definition = {
    h: {
        description: 'Show this screen.',
        alias: 'help',
        type: 'help',
    },
    v: {
        description: 'Show the current version.',
        alias: 'version',
        type: 'help',
    },
    f: {
        description: 'Show only logs that match the specified regex. You can speficy as many filters as you\'d like.',
        alias: 'filter',
        type: 'string',
        multiple: true,
    },
    i: {
        description: 'Ignore logs that match the specified regex. You can speficy as many ignores as you\'d like.',
        alias: 'ignore',
        type: 'string',
        multiple: true,
    },
    p: {
        description: 'Parses the input using this modifier. Allowed: json, logfmt, table or a regex expression with named groups.',
        alias: 'parser',
        type: 'string',
    },
    o: {
        description: 'Formats the output using this template. Allowed: json, logfmt, inspect, original, table or a bigodon template.',
        alias: 'output',
        type: 'string',
    },
    F: {
        description: 'Show only logs that match the field filter (Bigodon expression). Requires a parser like -p json.',
        alias: 'field',
        type: 'string',
        multiple: true,
    },
    H: {
        description: 'Always log the first line (which is the header for tables).',
        alias: 'headers',
        type: 'boolean',
    },
    k: {
        description: 'Shortcut for kubectl tables (equivalent to -p table -o table).',
        alias: 'kubectl',
        type: 'boolean',
    },
    P: {
        description: 'Pick only these columns from parsed objects (comma-separated). Requires a parser like -p json.',
        alias: 'pick',
        type: 'string',
    },
};

const $ = '$ '.gray;
const examples = [
    '\n\nExamples:\n',
    'Find lines containing "error" (shorthand for a single -f filter):'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt error',
    'Find lines containing "checkout" and "alice" (AND):'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -f checkout -f alice',
    'Ignore noise (drop health/metrics lines):'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -i healthz -i metrics',
    'Find errors while ignoring known spam:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -f error -i NullPointer -i "retrying in"',
    'Parse JSON (default output is inspect):'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json',
    'Parse JSON and format a clean line:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o \'[{{ts}} {{upper level}}] {{message}}\'',
    'Field filter: only slow requests (delay_ms > 200):'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F \'gt delay_ms 200\' -o original',
    'Field filter: combine conditions:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F \'and (eq level "error") (gt http.status 499)\' -o \'[{{ts}} {{upper level}}] {{message}}\'',
    'Parse logfmt and convert to JSON:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/logfmt.log | lt -p logfmt -o json',
    'Kubernetes tables: find rows containing "gateway", keep headers:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -H gateway',
    'Kubernetes tables: -k is shorthand for -p table -o table:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -k payment',
    'Kubernetes tables: pick columns (NAME, STATUS, AGE):'.dim,
    $ + 'cat ./examples/table.log | lt -p table -P NAME,STATUS,AGE -o table',
    'Kubernetes tables: show pods that are not fully ready:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -k -F \'lt (itemAt (split READY "/") 0) (itemAt (split READY "/") 1)\'',
    'Custom regex parsing (extract fields) and output as logfmt:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -p \'(?<ts>\\S+) \\[(?<level>\\w+)\\] (?<message>.*)\' -o logfmt',
];

const usage = Bossy.usage(definition, 'lt [options]\n   Or: lt <filter>') + examples.join('\n');

module.exports = { definition, usage };
