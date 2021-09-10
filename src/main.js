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
const formatJson = require('./transformers/format-json');

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

    const parser = [];
    if(args.parser?.toLowerCase() === 'json') {
        parser.push(parseJson());
    }
    if(args.parser?.toLowerCase() === 'logfmt') {
        parser.push(parseLogfmt());
    }

    const pipeline = new LogPipeline([
        ...args.filter.map(filter),
        ...args.ignore.map(ignore),
        ...parser,
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

run();
