/*jshint node:true */
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
var minimist = require('minimist');

module.exports = function(grunt) {

  grunt.registerMultiTask('test', 'run karma.', function() {
    var done = this.async();
    var options = this.options({
      background: false
    });


    var opts = _.cloneDeep(options);
    // Merge options onto data, with data taking precedence.
    var data = _.merge(opts, this.data);
    // parse all karma argv
    var args = minimist(process.argv.slice(2));
    //将string类型的boolean数据转换为boolean
    parseBoolean(args);
    data = _.merge(data, args);


    if (data.configFile) {
      data.configFile = path.resolve(data.configFile);
      data.configFile = grunt.template.process(data.configFile);
    }

    if (data.files){
      data.files = _.flatten(data.files);
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
//将string类型的boolean数据转换为boolean
function parseBoolean (args) {
    _.forIn(args, function (value, key) {
        if (value === 'true') {
            args[key] = true;
        } else if (value === 'false') {
            args[key] = false;
        }
    });
}
