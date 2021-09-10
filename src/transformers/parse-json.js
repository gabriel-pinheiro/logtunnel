module.exports = () => line => {
    try {
        return JSON.parse(line);
    } catch {
        return false;
    }
};
