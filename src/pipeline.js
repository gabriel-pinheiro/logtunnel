'use strict';

const { FieldFilter } = require('./transformers/filters/field');
const { FindFilter } = require('./transformers/filters/find');
const { IgnoreFilter } = require('./transformers/filters/ignore');
const { SelectFilter } = require('./transformers/filters/select');
const { outputFactory } = require('./transformers/outputs/factory');
const { parseFactory } = require('./transformers/parsers/factory');

const debug = require('debug')('logtunnel:pipeline');

class LogPipeline {
    constructor(args, stdout) {
        this.firstLine = null;
        this.args = this._normalizeArgs(args);
        this.stdout = stdout;
        this.outputTransformer = outputFactory(this.args.output);
        this.isOutputBuffered = Boolean(this.outputTransformer.flush);
        this.transformers = this._buildTransformers()
                .filter(t => t !== null);
    }

    onLogLine(line) {
        debug('got line: ' + line)
        const isFirstLine = this._updateFirstLine(line);
        this._logLine(line, isFirstLine)
            .catch(error => {
                // Covering this would kill the process
                /* $lab:coverage:off$ */
                console.error('Error:', error.message);
                process.exit(1);
                /* $lab:coverage:on$ */
            });
    }

    async _logLine(line, isFirstLine) {
        let output = line;

        for (let transformer of this.transformers) {
            const result = await transformer.run(
                output,
                line,
                isFirstLine ? null : this.firstLine,
            );

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

        if (this.isOutputBuffered) {
            return;
        }

        this.stdout.write(output + '\n');
    }

    _updateFirstLine(line) {
        if (this.firstLine) {
            return false;
        }

        this.firstLine = line;
        if(this.args.headers && !this.isOutputBuffered) {
            this.stdout.write(this.firstLine + '\n');
        }

        return true;
    }

    onEnd() {
        if (!this.isOutputBuffered) {
            return;
        }

        const lines = this.outputTransformer.flush();
        lines.forEach(line => this.stdout.write(line + '\n'));
    }

    _buildTransformers() {
        return [
            // First of all, filter which lines to accept
            this.args._ ? new FindFilter(this.args._) : null,
            ...this.args.filter.map(f => new FindFilter(f)),
            ...this.args.ignore.map(i => new IgnoreFilter(i)),
            // Parse them...
            parseFactory(this.args.parser),
            // ...and apply field filters
            ...this.args.field.map(f => new FieldFilter(f)),
            // ...optionally select/exclude specific columns
            this.args.select ? new SelectFilter(this.args.select, false) : null,
            this.args.exclude ? new SelectFilter(this.args.exclude, true) : null,
            // And finally format the output
            this.outputTransformer,
        ];
    }

    _normalizeArgs(args) {
        const normalized = { ...args };

        if (normalized.kubectl) {
            normalized.parser = 'table';
            normalized.output = 'table';
        }

        return normalized;
    }
}

module.exports.LogPipeline = LogPipeline;
