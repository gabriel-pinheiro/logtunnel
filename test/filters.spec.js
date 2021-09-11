const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const filter = require('../src/transformers/filter');
const ignore = require('../src/transformers/ignore');
const field = require('../src/transformers/field');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('filters', () => {
    describe('--filter', () => {
        it('should accept matching strings', () => {
            const transformer = filter('psu');
            const result = transformer('lorem ipsum dolor sit amet');
            expect(result).to.be.true();
        });
    
        it('should reject non-matching strings', () => {
            const transformer = filter('aaa');
            const result = transformer('lorem ipsum dolor sit amet');
            expect(result).to.be.false();
        });
    
        it('should be case insensitive', () => {
            const transformer = filter('PsU');
            const result = transformer('lorem ipSUm dolor sit amet');
            expect(result).to.be.true();
        });
    
        it('should support regex', () => {
            const transformer = filter('i.*m');
            const result = transformer('lorem ipsum dolor sit amet');
            expect(result).to.be.true();
        });
    });
    describe('--ignore', () => {
        it('should reject matching strings', () => {
            const transformer = ignore('psu');
            const result = transformer('lorem ipsum dolor sit amet');
            expect(result).to.be.false();
        });
    
        it('should accept non-matching strings', () => {
            const transformer = ignore('aaa');
            const result = transformer('lorem ipsum dolor sit amet');
            expect(result).to.be.true();
        });
    
        it('should be case insensitive', () => {
            const transformer = ignore('PsU');
            const result = transformer('lorem ipSUm dolor sit amet');
            expect(result).to.be.false();
        });
    
        it('should support regex', () => {
            const transformer = ignore('i.*m');
            const result = transformer('lorem ipsum dolor sit amet');
            expect(result).to.be.false();
        });
    });
    describe('--field', () => {
        it('should error when strings wasn\'t parsed into object', () => {
            const transformer = field('a');
            expect(() => transformer('a')).to.throw();
        });

        it('should compare equality', () => {
            const transformer = field('foo == "bar"');
            expect(transformer({ foo: 'bar' })).to.be.true();
            expect(transformer({ foo: 'baz' })).to.be.false();
        });

        it('should compare inequality with strings', () => {
            const transformer = field('foo >= 3');
            expect(transformer({ foo: '3' })).to.be.true();
            expect(transformer({ foo: '2' })).to.be.false();
        });

        it('should accept javascript', () => {
            const transformer = field('foo.toLowerCase().includes("bar")');
            expect(transformer({ foo: 'ABARA' })).to.be.true();
            expect(transformer({ foo: 'ABADA' })).to.be.false();
        });
    });
});
