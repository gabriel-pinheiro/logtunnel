class LogPipeline {
    constructor(transformers, args) {
        this.transformers = transformers.filter(t => t !== null);
        this.firstLine = null;
        this.args = args;
    }

    onLogLine(line) {
        try {
            this._logLine(line);
            this._updateFirstLine(line);
        } catch (e) {
            console.error('Error:', e.message);
            process.exit(1);
        }
    }

    _logLine(line) {
        let output = line;

        for (let transformer of this.transformers) {
            const result = transformer(output, line, this);

            // Transformer accepted the line
            if(result === true) {
                continue;
            }

            // Transformer rejected the line
            if(result === false) {
                return;
            }

            // Transformer modified the line
            output = result;
        }

        process.stdout.write(output + '\n');
    }

    _updateFirstLine(line) {
        if (this.firstLine) {
            return;
        }

        this.firstLine = line;
        if(this.args.headers) {
            process.stdout.write(this.firstLine + '\n');
        }
    }
}

module.exports.LogPipeline = LogPipeline;
