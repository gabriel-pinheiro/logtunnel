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
        description: 'Formats the output using this template. Allowed: json, logfmt, original or a mustache template.',
        alias: 'output',
        type: 'string',
    },
    F: {
        description: 'Show only logs that match the field filter. You can use JavaScript.',
        alias: 'field',
        type: 'string',
        multiple: true,
    },
    H: {
        description: 'Always log the first line (which is the header for tables).',
        alias: 'headers',
        type: 'boolean',
    },
};

const $ = '$ '.gray;
const examples = [
    '\n\nExamples:\n',
    'Find logs that contain "alice":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt alice',
    'Find logs that contain "alice" and "purchase":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -f alice -f purchase',
    'Find logs that contain "alice" and ignore the ones that contain "info":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -f alice -i info',
    'Parse logs as JSON and output them with that template:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o \'[{{lvl}}] {{log}}\'',
    'Parse logs as JSON, apply template and find the ones containing "alice":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o \'[{{lvl}}] {{log}}\' -f alice',
    'Parse logs as JSON, apply template and show the ones with "delay > 200":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o \'[{{lvl}} in {{delay}}ms] {{log}}\' -F \'delay > 200\'',
    'Parse logs as JSON, apply template and show the ones with "log" containing "Alice":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o \'[{{lvl}}] {{log}}\' -F \'log.toLowerCase().includes("alice")\'',
    'Parse logs as logfmt, show the ones with "delay > 200" and show their original line (as if no parsing happened):'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/logfmt.log | lt -p logfmt -o original -F \'delay > 200\'',
    'Parse logs with regex, and output in logfmt:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -p \'\\[(?<lvl>\\S*) in\\s*(?<delay>\\d*)ms\\] (?<log>.*)\' -o logfmt',
    'Parse logs with regex, and show the ones with "delay > 200":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/text.log | lt -p \'(?<delay>\\d+)ms\' -o original -F \'delay > 200\'',
    'Parse table and show rows containing "cilium":'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o original -f cilium',
    'Parse table, show rows containing "cilium" and the first headers row:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o original -f cilium -H',
    'Parse table, show rows with RESTARTS > 0:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o original -F \'RESTARTS > 0\' -H',
    'Show rows that are not ready:'.dim,
    $ + 'curl -s https://cdn.codetunnel.net/lt/table.log | lt -p \'(?<up>\\d)/(?<total>\\d)\' -o original -F \'up < total\' -H',
];

const usage = Bossy.usage(definition, 'lt [options]\n   Or: lt <filter>') + examples.join('\n');

module.exports = { definition, usage };
