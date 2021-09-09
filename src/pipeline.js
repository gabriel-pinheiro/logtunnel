class LogPipeline {
    constructor(transformers) {
        this.transformers = transformers;
    }

    onLogLine(line) {
        let output = line;

        for (let transformer of this.transformers) {
            const result = transformer(output);

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
