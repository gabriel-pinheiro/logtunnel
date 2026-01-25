class FindFilter {
    constructor(regexStr) {
        this.regex = new RegExp(regexStr, 'i');
    }

    run(line) {
        return this.regex.test(line);
    }
}

module.exports = { FindFilter };
