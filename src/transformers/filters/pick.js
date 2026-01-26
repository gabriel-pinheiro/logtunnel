class PickFilter {
    constructor(columns) {
        this.columns = columns
            .split(',')
            .map(column => column.trim())
            .filter(Boolean);
    }

    async run(line) {
        if (typeof line !== 'object') {
            throw new Error("To use -P/--pick, you need to specify a parser like '-p json'");
        }

        return Object.fromEntries(
            this.columns
                .filter(column => line[column] !== undefined)
                .map(column => [column, line[column]])
        );
    }
}

module.exports = { PickFilter };
