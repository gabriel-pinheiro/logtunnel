const logfmt = require('logfmt');

class LogfmtParse {
    run(line) {
        try {
            return logfmt.parse(line);
        } catch {
            return false;
        }
    }
}

module.exports = { LogfmtParse };
