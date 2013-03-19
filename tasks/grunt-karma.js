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
  grunt.registerMultiTask('karma', 'run karma.', function() {
    var done = this.async();
    var options = this.options();
    var data = this.data;
    //merge options onto data, with data taking precedence
    Object.keys(this.options()).forEach(function(prop){
      if (!data[prop]) data[prop] = options[prop];
    });

    if (data.configFile) {
      data.configFile = grunt.template.process(data.configFile);
    }
    //support `karma run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, finished.bind(done));
      return;
    }
    server.start(data, finished.bind(done));
  });
};

function finished(code){ return this(code === 0); }