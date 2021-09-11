const Lab = require('@hapi/lab');

const LogSourceTests = require('./unit/log-source.spec');

const lab = exports.lab = Lab.script();
const { describe } = lab;

describe('unit', () => {
    describe('log-source', LogSourceTests.run(lab));
});