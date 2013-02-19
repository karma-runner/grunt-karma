/*
 * gruntacular
 * https://github.com/OpenWebStack/gruntacular
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

var runner = require('testacular').runner;
var server = require('testacular').server;

module.exports = function(grunt) {
  grunt.registerMultiTask('testacular', 'run testacular.', function() {
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
    //support `testacular run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, finished.bind(done));
      return;
    }
    server.start(data, finished.bind(done));
  });
};

function finished(code){ return this(code === 0); }