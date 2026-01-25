class TableOutput {
    constructor() {
        this.rows = [];
        this.columns = [];
        this.columnWidths = new Map();
    }

    run(line) {
        if (typeof line !== 'object') {
            throw new Error("To use an output transformer, you need to specify a parser like '-p json'");
        }

        this.rows.push(line);

        Object.keys(line).forEach(column => {
            if (!this.columnWidths.has(column)) {
                this.columns.push(column);
                this.columnWidths.set(column, column.length);
            }

            const cell = this._toCell(line[column]);
            const width = this.columnWidths.get(column);
            if (cell.length > width) {
                this.columnWidths.set(column, cell.length);
            }
        });
        return true;
    }

    flush() {
        if (this.rows.length === 0) {
            return [];
        }

        const columns = this.columns;
        const widths = columns.map(column => this.columnWidths.get(column));

        const lines = [];
        lines.push(this._formatRow(columns, widths));
        this.rows.forEach(row => {
            const cells = columns.map(column => this._toCell(row[column]));
            lines.push(this._formatRow(cells, widths));
        });

        return lines;
    }

    _toCell(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    }

    _formatRow(cells, widths) {
        return cells
            .map((cell, index) => cell.padEnd(widths[index]))
            .join('  ')
            .trimEnd();
    }
}

module.exports = { TableOutput };
