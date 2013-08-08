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
            background: false
        });
        var data = this.data;

        // Merge karma config files property from global options and specified target options
        var files = mergeFilePatterns(grunt, data, options);

        //merge options onto data, with data taking precedence
        data = _.merge(options, data);

        data.files = files; // replace with merged file list

        if (data.configFile) {
            data.configFile = path.resolve(data.configFile);
            data.configFile = grunt.template.process(data.configFile);
        }

        //pass cli args on as client args, for example --grep=x
        data.clientArgs = require('optimist').argv;

        //support `karma run`, useful for grunt watch
        if (this.flags.run){
            runner.run(data, done);
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

function mergeFilePatterns(grunt, globalOptions, targetOptions) {

    var filePatterns = [];
    if (targetOptions.files != undefined && targetOptions.files != undefined) {
        filePatterns = grunt.util._.clone(targetOptions.files);
    }
    // global options are listed first in the files.src array
    if (globalOptions.files != undefined && globalOptions.files != undefined) {
        filePatterns = filePatterns.concat(grunt.util._.clone(globalOptions.files));
    }

    var files = [];
    filePatterns.forEach(function (item) {
        var list = undefined;
        var obj = {};
        // the following properties default to true
        obj.pattern = undefined;
        obj.watched = item.watched === undefined || item.watched ? undefined: false;
        obj.served = item.served === undefined || item.served ? undefined: false;
        obj.included = item.included === undefined || item.included ? undefined: false;

        if ( item.pattern ) {
            list = grunt.file.expand(item.pattern);
            list.forEach(function (file) {
                obj.pattern = undefined
                var entry = grunt.util._.clone(obj);
                entry.pattern = file;
                files.push(entry);
            });
        } else if (grunt.util._.isArray(item)) {
            list = grunt.file.expand(item);
            list.forEach(function (file) {
                files.push(file);
            });
        } else {
            files.push(item);
        }
    });

    return files;
}