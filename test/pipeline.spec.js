const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { runPipeline, _, f, i, F, p, o, H } = require('./utils');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('pipeline', () => {
    it('should remove rejected lines and keep accepted ones', async () => {
        const args = [
            f('potato')
        ];
        const actual = await runPipeline([
            'yada yada yada',
            'lorem ipsum POTATO dolor',
            'ablueblue POTATO',
            'foo bar',
        ], args);
        const expected = [
            'lorem ipsum POTATO dolor',
            'ablueblue POTATO',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply multiple filters', async () => {
        const args = [
            f('foo'),
            f('bar'),
            i('nope'),
        ];
        const actual = await runPipeline([
            '1. foo',
            '2. foo bar nope',
            '3. foo bar',
            '4. bar',
        ], args);
        const expected = [
            '3. foo bar',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply default argument as filter', async () => {
        const args = [
            _('foo'),
            i('bar'),
        ];
        const actual = await runPipeline([
            '1. foo',
            '2. foo bar',
            '3. baz',
        ], args);
        const expected = [
            '1. foo',
        ];

        expect(actual).to.equal(expected);
    });

    it('should parse and format correctly', async () => {
        const args = [
            p('logfmt'),
            o('json'),
        ];
        const actual = await runPipeline([
            'foo=bar baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should filter by the original line even when parsers and outputs are provided', async () => {
        const args = [
            p('logfmt'),
            o('json'),
            i('o=n'),
        ];
        const actual = await runPipeline([
            'foo=bar baz=qux',
            'foo=nope baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply field filters after parse', async () => {
        const args = [
            p('logfmt'),
            o('json'),
            F('startsWith foo "b"'),
        ];
        const actual = await runPipeline([
            'foo=bar baz=qux',
            'foo=nope baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply multiple field filters', async () => {
        const args = [
            p('logfmt'),
            o('json'),
            F('startsWith foo "b"'),
            F('endsWith foo "r"'),
        ];
        const actual = await runPipeline([
            'foo=baz baz=qux',
            'foo=bar baz=qux',
            'foo=tar baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should log headers when -H is provided', async () => {
        const args = [
            p('table'),
            o('original'),
            F('eq NAME "foo"'),
            H(),
        ];
        const actual = await runPipeline([
            'NAME',
            'foo',
            'bar',
        ], args);
        const expected = [
            'NAME',
            'foo',
        ];

        expect(actual).to.equal(expected);
    });
});
