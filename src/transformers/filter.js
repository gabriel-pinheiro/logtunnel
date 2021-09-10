module.exports = regexStr => line => {
    const regex = new RegExp(regexStr, 'i');
    return regex.test(line);
};
