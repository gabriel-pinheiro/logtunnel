let headers;

function splitColumns(line) {
    return line.replace(/\s+/g, ' ').split(' ');
}

module.exports = () => (line, _original, pipeline) => {
    if(!pipeline.firstLine) {
        headers = splitColumns(line);
        // Ignore first line, it's the header
        return false;
    }
    const columns = splitColumns(line);
    const obj = {};

    headers.forEach((header, i) => {
        obj[header] = columns[i];
    });

    return obj;
};
