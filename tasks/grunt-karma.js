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
var _ = require('lodash');

module.exports = function(grunt) {

  grunt.registerMultiTask('karma', 'run karma.', function() {
    var done = this.async();
    var options = this.options({
      background: false,
      // allow passing of cli args on as client args, for example --grep=x
      client: { args: optimist.argv._ }
    });

    var data = this.data;
    //merge options onto data, with data taking precedence
    data = _.merge(options, data);

    if (data.configFile) {
      data.configFile = path.resolve(data.configFile);
      data.configFile = grunt.template.process(data.configFile);
    }

    // 

    // Let grunt resolve the files array
    data.files = this.filesSrc;

    //support `karma run`, useful for grunt watch
    if (this.flags.run){
      runner.run(data, finished.bind(done));
      return;
    }

    //allow karma to be run in the background so it doesn't block grunt
    if (data.background){
      grunt.util.spawn({cmd: 'node', args: [path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(data)]}, function(){});
      done();
    }
    else {
      server.start(data, finished.bind(done));
    }
  });
};

function finished(code){ return this(code === 0); }
