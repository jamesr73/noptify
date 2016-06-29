var noptify = require('..');
var assert = require('assert');

describe('Collectable', function() {

  describe('.stdin()', function() {
    it('provides a helper method to read from stdin', function() {
      var program = noptify();
      assert.ok(typeof program.stdin === 'function', 'stdin defined');
    });

    it('can define a callback to receive stdin after .parse() is called', function(done) {
      var program = noptify(['', '']);
      var str = 'testing out stdin helper';
      program.stdin(function(err, res) {
        assert.equal(res, str);
        done();
      });

      program.parse();

      process.nextTick(function() {
        process.stdin.emit('data', str);
        process.stdin.emit('end');
      });
    });

    it('only receives stdin if there are no args remaining after parsing', function(done) {
      var program = noptify(['', '', 'could_be_a_file']);
      program.stdin(function(err, res) {
        assert.equal(false, true, 'should not get here');
      });

      program.parse();

      process.nextTick(function() {
        process.stdin.emit('data', 'anything');
        process.stdin.emit('end');
      });

      process.nextTick(function() {
        done();
      });
    });

    it('can force stdin when there are args remaining after parsing', function(done) {
      var program = noptify(['', '', 'not_a_file']);
      var str = 'testing out stdin helper';

      program.parse();
      program.stdin(true, function(err, res) {
        assert.equal(res, str);
        done();
      });

      process.nextTick(function() {
        process.stdin.emit('data', str);
        process.stdin.emit('end');
      });
    });

    it('should support force if .stdin() called before .parse()?');
    it('needs confirmation of behaviour calling .stdin() after .parse()')
  });

  describe('.files()', function() {
    it('provides a helper method to read from files', function() {
      var program = noptify();
      assert.ok(typeof program.files === 'function', 'collect defined');
    });
    it('can define a callback to recieve collected files after .parse() is called', function(done) {
      var program = noptify(['', '', 'test/fixtures/a.js', 'test/fixtures/b.js']);
      program.parse();

      program.files(function(err, data) {
        assert.equal(data, 'a\nb\n');
        done();
      });
    });
  });

  describe('.collect()', function() {
    it('provides a helper method to read from files or stdin', function() {
      var program = noptify();
      assert.ok(typeof program.collect === 'function', 'collect defined');
    });

    it.skip('can specify a program collect data from files or stdin', function(done) {
      var program = noptify();
      var str = 'testing out stdin helper';

      program.collect();
      program.on('stdin', function(err, res) {
        assert.equal(res, str);
        done();
      });

      program.parse();

      process.nextTick(function() {
        process.stdin.emit('data', str);
        process.stdin.emit('end');
      });
    });
  });
});
