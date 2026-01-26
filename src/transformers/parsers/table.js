class TableParse {
    constructor() {
        this.headers = null;
    }

    run(line, _original, firstLine) {
        if (!firstLine) {
            // Ignore first line, it's the headers
            this.headers = this._splitColumns(line);
            return false;
        }
        if (!this.headers) {
            this.headers = this._splitColumns(firstLine);
        }

        const columns = this._splitColumns(line);
        const obj = {};

        this.headers.forEach((header, i) => {
            obj[header] = columns[i];
        });

        return obj;
    }

    _splitColumns(line) {
        return line.replace(/\s+/g, ' ').split(' ');
    }
}

module.exports = { TableParse };
