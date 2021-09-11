'use strict';
const debug = require('debug')('logtunnel:pipeline');

const filter = require('./transformers/filter');
const ignore = require('./transformers/ignore');
const parse = require('./transformers/parse');
const field = require('./transformers/field');
const output = require('./transformers/output');

class LogPipeline {
    constructor(args, stdout) {
        this.firstLine = null;
        this.args = args;
        this.stdout = stdout;
        this.transformers = this._buildTransformers().filter(t => t !== null);
    }

    onLogLine(line) {
        try {
            debug('got line: ' + line)
            this._logLine(line);
            this._updateFirstLine(line);
        } catch (e) {
            // Covering this would kill the process
            /* $lab:coverage:off$ */
            console.error('Error:', e.message);
            process.exit(1);
            /* $lab:coverage:on$ */
        }
    }

    _logLine(line) {
        let output = line;

        for (let transformer of this.transformers) {
            const result = transformer(output, line, this);

            // Transformer accepted the line
            if(result === true) {
                debug('transformer accepted line');
                continue;
            }

            // Transformer rejected the line
            if(result === false) {
                debug('transformer rejected line');
                return;
            }

            // Transformer modified the line
            output = result;
            debug('line transformed: ' + JSON.stringify(output)); 
        }

        this.stdout.write(output + '\n');
    }

    _updateFirstLine(line) {
        if (this.firstLine) {
            return;
        }

        this.firstLine = line;
        if(this.args.headers) {
            this.stdout.write(this.firstLine + '\n');
        }
    }

    _buildTransformers() {
        return [
            // First of all, filter which lines to accept
            this.args._ ? filter(this.args._) : null,
            ...this.args.filter.map(filter),
            ...this.args.ignore.map(ignore),
            // Parse them...
            parse(this.args.parser),
            // ...and apply field filters
            ...this.args.field.map(field),
            // And finally format the output
            output(this.args.output),
        ];
    }
}

module.exports.LogPipeline = LogPipeline;
