class TableParse {
    constructor() {
        this.headers = null;
    }

    run(line, _original, pipeline) {
        if (!pipeline.firstLine) {
            // Ignore first line, it's the headers
            return false;
        }
        if (!this.headers) {
            this.headers = this._splitColumns(pipeline.firstLine);
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
