/*
 * grunt-karma
 * https://github.com/karma-runner/grunt-karma
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */


module.exports = function (grunt) {
    var runner = require('karma').runner;
    var server = require('karma').server;
    var path = require('path');
    var optimist = require('optimist');

    var _ = grunt.util._;

    grunt.registerMultiTask('karma', 'run karma.', function () {
        var done = this.async();
        var options = this.options({
            background: false
        });
        var config = this.data;

        console.log("\n------------ karam.config:\n", this);
        //_.each(this.files, function(file) {console.log("file:",file);});

        console.log("\n--------options\n",options);
        //_.each(options.files, function(file) {console.log("file:",file);});

        console.log("\n--------data\n",config);
        //_.each(config.files, function(file) {console.log("file:",file);});

        var files = undefined;
        if (config.nestedFileMerge != false) {
            // Merge karma config files property from global options and specified target options
            // expanding each file entry:
            // this supports filtered selections [ 'path/**/*.js', '!path/**/*.spec.js' ]
            // caveat: files created after karma server is started will not be included or watched.
            files = mergeFilePatterns(grunt, config, options);
        }

        //merge options onto config, with config taking precedence
        config = _.merge(options, config);

        if(files) {
            config.files = files; // replace with merged file list
        }
        config.target = this.target;

        //config.files.forEach(function(it) {console.log("loading ",it);});
        if (config.configFile) {
            config.configFile = path.resolve(config.configFile);
            config.configFile = grunt.template.process(config.configFile);
        }

        //pass cli args on as client args, for example --grep=x
        config.clientArgs = require('optimist').argv;

        //console.log("\n--------compiled options:\n",config);

        //_.each(config.files, function(file) {console.log("file:",file.pattern ? file.pattern : file);});

        //support `karma run`, useful for grunt watch
        if (this.flags.run) {
            console.log("\nkarma.runner.run(...)");
            runner.run(config, function(code) {
                console.log('\n', config.target,'Tests Complete...');
                done(code);
            });
            return;
        }

        //allow karma to be run in the background so it doesn't block grunt
        if (config.background) {
            console.log("\ngrunt.util.spawn(karma.server.start(...))");
            grunt.util.spawn({cmd: 'node', args: [path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(config)]}, function () {
            });
            console.log('\n', config.target,'Tests Complete...');
            done();
        }
        else {
            var asyncComplete = function(code) {
                console.log('\n', config.target,'Tests Complete...');
                return done(code === 0);
            };
            console.log("\nkarma.server.start(...)");
            server.start(config, asyncComplete);
        }
    });
};

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
        obj.watched = item.watched === undefined || item.watched ? undefined : false;
        obj.served = item.served === undefined || item.served ? undefined : false;
        obj.included = item.included === undefined || item.included ? undefined : false;

        if (item.pattern) {
            list = grunt.file.expand(item.pattern);
            list.forEach(function (file) {
                obj.pattern = undefined;
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
