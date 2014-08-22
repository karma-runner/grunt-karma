/*
 * grunt-karma
 * https://github.com/karma-runner/grunt-karma
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

var runner = require('karma').runner;
var server = require('karma').server;
var path = require('path');
var _ = require('lodash');

module.exports = function(grunt) {

  grunt.registerMultiTask('karma', 'run karma.', function() {
    var done = this.async();
    var options = this.options({
      background: false,
      files: [],
      client: {}
    });

    // Allow for passing cli arguments to `client.args` using  `--grep=x`
    var args = parseArgs(process.argv.slice(2));
    if (_.isArray(options.client.args)) {
        options.client.args = options.client.args.concat(args);
    } else {
        options.client.args = args;
    }

    // Merge karma default options
    _.defaults(options.client, {
        args: [],
        useIframe: true,
        captureConsole: true
    });

    var opts = _.cloneDeep(options);
    // Merge options onto data, with data taking precedence.
    var data = _.merge(opts, this.data);

    // But override the browsers array.
    if (data.browsers && this.data.browsers) {
      data.browsers = this.data.browsers;
    }

    // Merge client.args
    if (this.data.client && _.isArray(this.data.client.args)) {
        data.client.args = this.data.client.args.concat(options.client.args);
    }

    if (data.configFile) {
      data.configFile = path.resolve(data.configFile);
      data.configFile = grunt.template.process(data.configFile);
    }

    data.files = [].concat.apply(options.files, this.files.map(function(file) {
      return file.src.map(function(src) {
        var obj = { pattern: src };
        ['watched', 'served', 'included'].forEach(function(opt) {
          if (opt in file) {
            obj[opt] = file[opt];
          }
        });
        return obj;
      });
    }));

    //support `karma run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, finished.bind(done));
      return;
    }

    //allow karma to be run in the background so it doesn't block grunt
    if (data.background){
      var backgroundArgs = {
        cmd: 'node',
        args: process.execArgv.concat([path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(data)])
      };
      var backgroundProcess = grunt.util.spawn(backgroundArgs, function(error){
        if (error) {
          grunt.log.error(error);
        }
      });
      process.on('exit', function () {
        backgroundProcess.kill();
      });
      done();
    }
    else {
      server.start(data, finished.bind(done));
    }
  });
};

function finished(code){ return this(code === 0); }


// Parse out all cli arguments in the form of `--arg=something` or
// `-c=otherthing` and return the array.
function parseArgs(args) {
    return _.filter(args, function (arg) {
        return arg.match(/^--?/);
    });
}
