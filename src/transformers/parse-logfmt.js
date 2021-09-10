const logfmt = require('logfmt');

module.exports = () => line => {
    try {
        return logfmt.parse(line);
    } catch {
        return false;
    }
};
