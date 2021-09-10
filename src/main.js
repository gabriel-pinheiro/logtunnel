#!/usr/bin/env node
const semver = require('semver');
if(!semver.satisfies(process.version, '>=12')) {
    console.error(`Your NodeJS version (${process.version}) is too old for logtunnel :(\nUse at least NodeJS 12`);
    process.exit(1);
}

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
const field = require('./transformers/field');
const output = require('./transformers/output');
const formatJson = require('./transformers/format-json');

const debug = require('debug')('logtunnel:main');

const examples = [
    `tail -f logs.txt | lt err`,
    `tail -f logs.txt | lt -f 'error' -f 'client'`,
    `tail -f logs.txt | lt -f 'error' -i 'nullpointer'`,
    `tail -f logs.txt | lt -i 'debug'`,
    `tail -f logs.txt | lt -p json -F 'status >= 500'`,
    `tail -f logs.txt | lt -p json -F 'delay > 1000' -o '[{{severity}}] {{log}}'`
];
const usage = Bossy.usage(definition, 'lt [options]\n   Or: lt <filter>')
        + '\n\nExamples:\n\n'
        + examples.map(e => '  ' + e).join('\n');

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
        const pipeline = new LogPipeline([
            args._ ? filter(args._) : null,
            ...args.filter.map(filter),
            ...args.ignore.map(ignore),
            buildParser(args.parser),
            ...args.field.map(field),
            args.output ? output(args.output) : null,
            formatJson(),
        ]);
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

    return parseRegex(parser);
}

run();
