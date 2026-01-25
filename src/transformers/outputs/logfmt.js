const logfmt = require('logfmt');

class LogfmtOutput {
    run(line) {
        if (typeof line !== 'object') {
            throw new Error("To use an output transformer, you need to specify a parser like '-p json'");
        }

        return logfmt.stringify(line);
    }
}

module.exports = { LogfmtOutput };
