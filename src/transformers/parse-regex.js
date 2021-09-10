module.exports = regexStr => {
    const regex = new RegExp(regexStr, 'i');

    return line => {
        try {
            return regex.exec(line)?.groups ?? false;
        } catch {
            return false;
        }
    };
};
