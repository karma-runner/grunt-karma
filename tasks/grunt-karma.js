/*
 * grunt-karma
 * https://github.com/karma/grunt-karma
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

var runner = require('karma').runner;
var server = require('karma').server;

module.exports = function(grunt) {
  var _ = grunt.util._;

  grunt.registerMultiTask('karma', 'run karma.', function() {
    var done = this.async();
    var options = this.options({
      keepalive: true
    });
    var data = this.data;
    //merge options onto data, with data taking precedence
    data = _.merge(options, data);

    if (data.configFile) {
      data.configFile = grunt.template.process(data.configFile);
    }
    //support `karma run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, finished.bind(done));
      return;
    }
    server.start(data, finished.bind(done));
    if (! data.keepalive) {
      done();
    }
  });
};

function finished(code){ return this(code === 0); }
