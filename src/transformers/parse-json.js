module.exports = () => line => {
    try {
        const obj = JSON.parse(line);
        if(typeof obj !== 'object') {
            return false;
        }

        return obj;
    } catch {
        return false;
    }
};
