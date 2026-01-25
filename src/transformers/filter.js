module.exports = regexStr => {
    const regex = new RegExp(regexStr, 'i');
    return line => regex.test(line);
};
