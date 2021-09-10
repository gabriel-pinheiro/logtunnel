class LogPipeline {
    constructor(transformers) {
        this.transformers = transformers.filter(t => t !== null);
    }

    onLogLine(line) {
        try {
            this._onLogLine(line);
        } catch (e) {
            console.error('Error:', e.message);
            process.exit(1);
        }
    }

    _onLogLine(line) {
        let output = line;

        for (let transformer of this.transformers) {
            const result = transformer(output, line);

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
}

module.exports.LogPipeline = LogPipeline;
