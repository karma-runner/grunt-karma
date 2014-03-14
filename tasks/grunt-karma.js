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
      background: false
    });

    if (!options.client) {
        options.client = {};
    }
    // Allow for passing of `--grep=x` or `--grep=x,two`
    var args = grunt.option('grep')
    if (args) {
        args = _.map(args.split(','), function (arg) {
            return '--grep=' + arg;
        });
    }
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
    data.browsers = this.data.browsers || data.browsers;

    // Merge client.args
    if (_.isArray(this.data.client.args)) {
        data.client.args = this.data.client.args.concat(options.client.args);
    }

    if (data.configFile) {
      data.configFile = path.resolve(data.configFile);
      data.configFile = grunt.template.process(data.configFile);
    }

    //support `karma run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, finished.bind(done));
      return;
    }

    //allow karma to be run in the background so it doesn't block grunt
    if (data.background){
      var backgroundProcess = grunt.util.spawn({cmd: 'node', args: [path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(data)]}, function(){});
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
