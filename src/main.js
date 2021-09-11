#!/usr/bin/env node
const semver = require('semver');
if(!semver.satisfies(process.version, '>=12')) {
    console.error(`Your NodeJS version (${process.version}) is too old for logtunnel :(\nUse at least NodeJS 12`);
    process.exit(1);
}

require('colors');
const Bossy = require('@hapi/bossy');
const pkg = require('../package.json');
const { definition, usage } = require('./definition');
const { logSource } = require('./log-source');
const { LogPipeline } = require('./pipeline');

const filter = require('./transformers/filter');
const ignore = require('./transformers/ignore');
const parse = require('./transformers/parse');
const field = require('./transformers/field');
const output = require('./transformers/output');

const debug = require('debug')('logtunnel:main');

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
            parse(args.parser),
            ...args.field.map(field),
            output(args.output),
        ], args);

        debug('registering stdin');
        logSource(process.stdin).on('log-line', l => pipeline.onLogLine(l));
    } catch(e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

function buildArgs() {
    const args = Bossy.parse(definition);
    const emptyArrFields = ['filter', 'ignore', 'field'];

    if (args instanceof Error) {
        console.error(args.message);
        console.log(usage);

        process.exit(1);
    }

    emptyArrFields.forEach(field => {
        if(!args[field]) {
            args[field] = [];
        }
    });

    return args;
}

run();
