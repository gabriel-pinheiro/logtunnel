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
const formatJson = require('./transformers/format-json');
const output = require('./transformers/output');

const debug = require('debug')('logtunnel:main');

const examples = [
    `tail -f logs.txt | lt -f 'error'`,
    `tail -f logs.txt | lt -f 'error' -f 'nullpointer'`,
    `tail -f logs.txt | lt -i 'debug'`,
    `tail -f logs.txt | lt -p json -F 'status >= 500'`,
    `tail -f logs.txt | la -p json -F 'delay > 1000' -o '[{{severity}}] {{log}}'`
];
const usage = Bossy.usage(definition, 'lt [options]')
        + '\n\nExamples:\n\n'
        + examples.map(e => '  ' + e).join('\n');

function run() {
    debug('building args');
    const args = buildArgs();

    if(args.version) {
        console.log(`logtunnel/${pkg.version} NodeJS/${process.version}`);
        process.exit(0);
    }

    if(args.help) {
        console.log(usage);
        process.exit(0);
    }

    const pipeline = new LogPipeline([
        ...args.filter.map(filter),
        ...args.ignore.map(ignore),
        buildParser(args.parser),
        buildFormatter(args.output),
        formatJson(),
    ]);
    stdin.on('log-line', l => pipeline.onLogLine(l));
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

function buildFormatter(format) {
    if(!format) {
        return null;
    }

    return output(format);
}

run();
