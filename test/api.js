var noptify = require('..');
var assert  = require('assert');
var sinon   = require('sinon');

describe('API', function() {

  it('returns an instanceof Noptify', function() {
    assert.ok(noptify() instanceof noptify.Noptify);
  });


  it('is typically used like so', function() {
    var program = noptify(['node', 'file.js', '-d', '--dirname', './', '-p', '3000', 'app.js', 'base.js'])
      .option('debug', '-d', 'Enabled debug output', Boolean)
      .option('dirname', 'The path to the output directory')
      .option('port', '-p', 'The port you wish to listen on', Number)

    // opts => nopt result
    var opts = program.parse();

    assert.deepEqual(opts, {
      port: 3000,
      debug: true,
      dirname: './',
      argv: {
        remain: ['app.js', 'base.js'],
        cooked: ['--debug', '--dirname', './', '--port', '3000', 'app.js', 'base.js'],
        original: ['-d', '--dirname', './', '-p', '3000', 'app.js', 'base.js']
      }
    });
  });

  describe('options', function() {
    it('supports .option(name)', function() {
      var opts = noptify(['', '', '--lonely', 'option', '--single'])
        .option('lonely')
        .option('single')
        .parse();

      assert.equal(opts.lonely, 'option');
      assert.equal(opts.single, 'true'); // TODO: confirm behaviour
    });

    it('supports .option(name, description)', function() {
      var opts = noptify(['', '', '--lonely', 'option', '--single'])
        .option('lonely', 'not really')
        .option('single', 'and happy')
        .parse();

      assert.equal(opts.lonely, 'option');
      assert.equal(opts.single, 'true'); // TODO: confirm behaviour
    });

    it('supports .option(name, description, type)', function() {
      var opts = noptify(['', '', '-lonely', 'option', '-single'])
        .option('lonely', 'not really')
        .option('single', 'and happy', Boolean)
        .parse();

      assert.equal(opts.lonely, 'option');
      assert.equal(opts.single, true);
    });

    it('supports .option(name, shorthand, description)', function() {
      var opts = noptify(['', '', '-l', 'option', '-s'])
        .option('lonely', '-l', 'not really')
        .option('single', '-s', 'and happy')
        .parse();

      assert.equal(opts.lonely, 'option');
      assert.equal(opts.single, 'true'); // TODO: confirm behaviour
    });

    it('supports .option(name, shorthand, description, type)', function() {
      var opts = noptify(['', '', '-l', 'option', '-s'])
        .option('lonely', '-l', 'not really')
        .option('single', '-s', 'and happy', Boolean)
        .parse();

      assert.equal(opts.lonely, 'option');
      assert.equal(opts.single, true);
    });

    it('validates option against type');

    it('supports .option(..., type) with nopt type Array');

    it('supports .shorthand() separate from .option()', function() {
      var opts = noptify(['node', 'file.js', '-lc'])
        .option('line-comment', 'Ouputs with debugging information', Boolean)
        .shorthand('lc', '--line-comment')
        .parse();

      assert.equal(opts['line-comment'], true);
    });

    it('supports .shorthand() multiple times', function() {
      var opts = noptify(['node', 'file.js', '-bc', '-lc'])
        .option('block-comment', 'Ouputs with debugging information', Boolean)
        .option('line-comment', 'Ouputs with debugging information', Boolean)
        .shorthand('bc', '--block-comment')
        .shorthand('lc', '--line-comment')
        .parse();

      assert.equal(opts['line-comment'], true);
      assert.equal(opts['block-comment'], true);
    });

    it('supports .shorthand() with object of multiple shorthands', function() {
      var opts = noptify(['node', 'file.js', '-bc', '-lc'])
        .option('block-comment', 'Ouputs with debugging information', Boolean)
        .option('line-comment', 'Ouputs with debugging information', Boolean)
        .shorthand({
          bc: '--block-comment',
          lc: '--line-comment'
        })
        .parse();

      assert.equal(opts['line-comment'], true);
      assert.equal(opts['block-comment'], true);
    });

    it('supports .shorthand() with option value', function() {
      var opts = noptify(['node', 'file.js', '-s'])
        .option('loglevel', 'Logging Level')
        .shorthand('s', ['--loglevel', 'silent'])
        .parse();

      assert.equal(opts.loglevel, 'silent');
    });
  });

  describe('program name', function() {
    it('sets program name from args if not supplied', function () {
      var program = noptify(['node', 'file.js', '-lc']);
      assert.equal(program._program, 'file.js');
    });

    it('sets program name from options', function () {
      var program = noptify(['node', 'file.js', '-lc'], { program: 'test-program' });
      assert.equal(program._program, 'test-program');
    });

    it('sets program name with .program()', function () {
      var program = noptify(['node', 'file.js', '-lc'])
        .program('explicit-program');
      assert.equal(program._program, 'explicit-program');
    });

    it('safely sets program name with .program()', function () {
      var program = noptify(['node', 'file.js', '-lc'])
        .program();
      assert.equal(program._program, '');
    });

    it('defaults program name from args if .program() doesn\'t provide a string');
  });

  describe('version', function() {
    it('outputs version and exits the process with --version', sinon.test(function() {
      var stubLog  = this.stub(console, 'log');
      var stubExit = this.stub(process, 'exit');
      var stubHelp = this.stub();
      var program = noptify(['', '', '--version'])
        .version('0.1.0')
        .parse();

      assert(stubLog.args[0], '0.1.0');
      assert(stubLog.calledOnce, true, 'version logged');
      assert(stubExit.calledOnce, true, 'process exited');
    }));

    it('reads version from package.json');
    it('only supports --version if a version is defined');
  });

  describe('help', function() {
    it('outputs help and exits the process with --help', sinon.test(function() {
      var stubLog  = this.stub(console, 'log');
      var stubExit = this.stub(process, 'exit');
      var stubHelp = this.stub();
      var program  = noptify(['node', 'test.js', '--help'])
        .option('lonely')
        .option('single', 'Single option')
        .option('typed', 'Typed option', Number)
        .option('named', '-n', 'Named option', String)
        .option('all', '-a', 'All set', Boolean)
        .on('help', function() {
          stubHelp();
        });

      var opts = program.parse();

      assert.equal(stubLog.calledOnce, true, 'help logged');
      assert.equal(stubExit.calledOnce, true, 'process exited');
      assert.equal(stubHelp.calledOnce, true, 'help emitted');

      var expected = [
        '',
        '  Usage: test.js [options]',
        '',
        '  Options:',
        '    -h, --help       \t- Show help usage',
        '    -v, --version    \t- Show package version',
        '    --lonely         \t- lonely: String',
        '    --single         \t- Single option',
        '    --typed          \t- Typed option',
        '    -n, --named      \t- Named option',
        '    -a, --all        \t- All set',
        '',
        '  Shorthands:',
        '    --h\t\t--help',
        '    --v\t\t--version',
        '    --n\t\t--named',
        '    --a\t\t--all',
        '',
      ].join('\n');
      assert.equal(stubLog.firstCall.args[0], expected, 'help text');
    }));

    it('should output shorthands help with single dash');
  });
});
