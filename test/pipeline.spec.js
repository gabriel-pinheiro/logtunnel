const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { runPipeline, _, f, i, F, P, p, o, H, k } = require('./utils');

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

    it('should buffer and format tables when requested', async () => {
        const args = [
            p('logfmt'),
            o('table'),
        ];
        const actual = await runPipeline([
            'foo=bar baz=qux',
            'foo=longer',
        ], args);
        const expected = [
            'foo     baz',
            'bar     qux',
            'longer',
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

    it('should pick columns before formatting', async () => {
        const args = [
            p('logfmt'),
            o('json'),
            P('foo,baz'),
        ];
        const actual = await runPipeline([
            'foo=bar baz=qux extra=nope',
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

    it('should log headers only once when both -H and -o table is provided', async () => {
        const args = [
            p('table'),
            o('table'),
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

    it('should not duplicate headers when parsing and reformatting tables with ignore filters', async () => {
        const args = [
            p('table'),
            o('table'),
            i('kube'),
        ];
        const actual = await runPipeline([
            'NAMESPACE NAME',
            'kube-system coredns',
            'default api',
        ], args);
        const expected = [
            'NAMESPACE  NAME',
            'default    api',
        ];

        expect(actual).to.equal(expected);
    });

    it('should not specify null prototype of regex parser', async () => {
        const args = [
            p('(?<num>\\d*)'),
        ];
        const [actual] = await runPipeline([
            '12',
        ], args);

        expect(actual).not.to.include('null prototype');
    });

    it('should parse and format kubectl tables with -k', async () => {
        const args = [
            k(),
        ];
        const actual = await runPipeline([
            'NAME AGE',
            'foo 1',
            'bar 22',
        ], args);
        const expected = [
            'NAME  AGE',
            'foo   1',
            'bar   22',
        ];

        expect(actual).to.equal(expected);
    });
});
