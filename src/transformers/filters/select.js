class SelectFilter {
    constructor(columns, isExclude = false) {
        this.columns = columns
            .split(',')
            .map(column => column.trim())
            .filter(Boolean);
        this.isExclude = Boolean(isExclude);
        this.columnsSet = new Set(this.columns);
    }

    async run(line) {
        if (typeof line !== 'object') {
            throw new Error("To use -s/--select or -x/--exclude, you need to specify a parser like '-p json'");
        }

        if (this.isExclude) {
            return Object.fromEntries(
                Object.entries(line)
                    .filter(([column]) => !this.columnsSet.has(column))
            );
        }

        return Object.fromEntries(
            this.columns
                .filter(column => line[column] !== undefined)
                .map(column => [column, line[column]])
        );
    }
}

module.exports = { SelectFilter };
