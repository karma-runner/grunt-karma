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
var optimist = require('optimist');

module.exports = function(grunt) {
  var _ = grunt.util._;

  grunt.registerMultiTask('karma', 'run karma.', function() {
    var done = this.async();
    var options = this.options({
      background: false,
      // allow passing of cli args on as client args, for example --grep=x
      clientArgs: require('optimist').argv,
      client: { args: require('optimist').argv }
    });
    var data = this.data;
    //merge options onto data, with data taking precedence
    data = _.merge(options, data);

    if (data.configFile) {
      data.configFile = path.resolve(data.configFile);
      data.configFile = grunt.template.process(data.configFile);
    }

    //support `karma run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, done);
      return;
    }

    //allow karma to be run in the background so it doesn't block grunt
    if (data.background){
      var callback = function() {};
      //if wait option is on run karma in the background but wait for it to finish before continuing task execution
      //avoids having multiple karma servers running if running more than once in the same task queue
      if(data.wait){
        callback = function(error, result, code) {
          grunt.log.writeln(result.stdout);
          if(result.stderr) grunt.warn(result.stderr);
          done(code === 0);
        };
      }

      grunt.util.spawn({cmd: 'node', args: [path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(data)]}, callback);

      //finish immediately
      if (!data.wait) done();
    }
    else {
      server.start(data, finished.bind(done));
    }
  });
};

function finished(code){ return this(code === 0); }
