const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { parseFactory } = require('../src/transformers/parsers/factory');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parsers', () => {
    it('should return null when no format is specified', () => {
        expect(parseFactory(void 0)).to.be.null();
    });

    it('should parse json', () => {
        const parser = parseFactory('json');
        expect(parser.run('{"foo": "bar"}')).to.equal({ foo: 'bar' });
    });

    it('should ignore invalid json lines when parsing json', () => {
        const parser = parseFactory('json');
        expect(parser.run('Oy')).to.be.false();
        expect(parser.run('"Oy"')).to.be.false();
    });

    it('should parse logfmt', () => {
        const parser = parseFactory('logfmt');
        expect(parser.run('foo=bar')).to.equal({ foo: 'bar' });
    });

    it('should ignore invalid logfmt lines when parsing logfmt', () => {
        const parser = parseFactory('logfmt');
        expect(parser.run(void 0)).to.be.false();
    });

    it('should parse regex', () => {
        const parser = parseFactory('\\[(?<severity>\\S+)\\s*(?<delay>\\d+)ms\\] (?<message>.*)');
        expect(parser.run('[info 20ms] lorem ipsum dolor')).to.equal({
            severity: 'info',
            delay: '20',
            message: 'lorem ipsum dolor',
        });

        expect(parser.run('foo')).to.be.false();
    });

    describe('tables', () => {
        const tableRows = [
            'NAME     TYPE',
            'foo      bar',
            'baz      qux',
        ];

        it('should ignore headers', () => {
            const pipeline = { firstLine: null };
            const parser = parseFactory('table');
            const line = tableRows[0];

            expect(parser.run(line, line, pipeline)).to.be.false();
        });

        it('should parse subsequent rows', () => {
            const pipeline = { firstLine: tableRows[0] };
            const parser = parseFactory('table');
            let line;

            line = tableRows[1];
            expect(parser.run(line, line, pipeline)).to.equal({ NAME: 'foo', TYPE: 'bar' });
            line = tableRows[2];
            expect(parser.run(line, line, pipeline)).to.equal({ NAME: 'baz', TYPE: 'qux' });
        });
    });
});
