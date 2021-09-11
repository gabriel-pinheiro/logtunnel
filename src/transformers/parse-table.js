function splitColumns(line) {
    return line.replace(/\s+/g, ' ').split(' ');
}

module.exports = () => {
    let headers;

    return (line, _original, pipeline) => {
        if(!pipeline.firstLine) {
            // Ignore first line, it's the headers
            return false;
        }
        if(!headers) {
            headers = splitColumns(pipeline.firstLine);
        }

        const columns = splitColumns(line);
        const obj = {};

        headers.forEach((header, i) => {
            obj[header] = columns[i];
        });

        return obj;
    };
};
