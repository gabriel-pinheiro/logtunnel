#!/usr/bin/env node
const semver = require('semver');
if(!semver.satisfies(process.version, '>=12')) {
    console.error(`Your NodeJS version (${process.version}) is too old for logtunnel :(\nUse at least NodeJS 12`);
    process.exit(1);
}

require('colors');
const Bossy = require('@hapi/bossy');
const pkg = require('../package.json');
const { definition } = require('./definition');
const { stdin } = require('./stdin');
const { LogPipeline } = require('./pipeline');

const filter = require('./transformers/filter');
const ignore = require('./transformers/ignore');
const parseJson = require('./transformers/parse-json');
const parseLogfmt = require('./transformers/parse-logfmt');
const parseRegex = require('./transformers/parse-regex');
const parseTable = require('./transformers/parse-table');
const field = require('./transformers/field');
const output = require('./transformers/output');

const debug = require('debug')('logtunnel:main');

const examples = `

Examples:
  curl -s https://cdn.codetunnel.net/lt/text.log   | lt alice                          ${'Find logs that contain "alice"'.gray}
  curl -s https://cdn.codetunnel.net/lt/text.log   | lt -f alice -f purchase           ${'Find logs that contain "alice" and "purchase"'.gray}
  curl -s https://cdn.codetunnel.net/lt/text.log   | lt -f alice -i info               ${'Find logs that contain "alice" and ignore the ones that contain "info"'.gray}
  curl -s https://cdn.codetunnel.net/lt/json.log   | lt -p json -o '[{{lvl}}] {{log}}' ${'Parse logs as JSON and output them with that template'.gray}
  curl -s https://cdn.codetunnel.net/lt/json.log   | lt -p json -o '[{{lvl}}] {{log}}' -f alice                        ${'Parse logs as JSON, apply template and find the ones containing "alice"'.gray}
  curl -s https://cdn.codetunnel.net/lt/json.log   | lt -p json -o '[{{lvl}} in {{delay}}ms] {{log}}' -F 'delay > 200' ${'Parse logs as JSON, apply template and show the ones with "delay > 200"'.gray}
  curl -s https://cdn.codetunnel.net/lt/json.log   | lt -p json -o '[{{lvl}}] {{log}}' -F 'log ~ "Alice"'              ${'Parse logs as JSON, apply template and show the ones with with "log" containing "Alice"'.gray}
  curl -s https://cdn.codetunnel.net/lt/logfmt.log | lt -p logfmt -o '{{log}}' -F 'delay > 200'                        ${'Parse logs as logfmt, apply template and show the ones with "delay > 200"'.gray}
  curl -s https://cdn.codetunnel.net/lt/text.log   | lt -p '\\[(?<lvl>\\S*) in\\s*(?<delay>\\d*)ms\\] (?<log>.*)' -o '{{log}}' -F 'delay > 200' ${'Parse logs with regex, apply template and show the ones with "delay > 200"'.gray}
`;
const usage = Bossy.usage(definition, 'lt [options]\n   Or: lt <filter>') + examples.trimEnd();

function run() {
    debug('building args');
    const args = buildArgs();

    if(args.version) {
        console.log(`logtunnel/${pkg.version} NodeJS/${process.version}`);
        process.exit(0);
    }

    if(args.help || process.argv.length === 2) {
        console.log(usage);
        process.exit(0);
    }

    try {
        debug('building pipeline');
        const pipeline = new LogPipeline([
            args._ ? filter(args._) : null,
            ...args.filter.map(filter),
            ...args.ignore.map(ignore),
            buildParser(args.parser),
            ...args.field.map(field),
            output(args.output),
        ], args);

        debug('registering stdin');
        stdin.on('log-line', l => pipeline.onLogLine(l));
    } catch(e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

function buildArgs() {
    const args = Bossy.parse(definition);

    if (args instanceof Error) {
        console.error(args.message);
        console.log(usage);

        process.exit(1);
    }

    return args;
}

function buildParser(parser) {
    if(!parser) {
        return null;
    }

    if(parser.toLowerCase() === 'json') {
        return parseJson();
    }
    if(parser.toLowerCase() === 'logfmt') {
        return parseLogfmt();
    }
    if(parser.toLowerCase() === 'table') {
        return parseTable();
    }

    return parseRegex(parser);
}

run();
