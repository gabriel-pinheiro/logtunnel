module.exports = regexStr => {
    const regex = new RegExp(regexStr, 'i');
    return line => regex.exec(line)?.groups ?? false;
};
