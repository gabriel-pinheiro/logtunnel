class RegexParse {
    constructor(regexStr) {
        this.regex = new RegExp(regexStr, 'i');
    }

    run(line) {
        return this.regex.exec(line)?.groups ?? false;
    }
}

module.exports = { RegexParse };
