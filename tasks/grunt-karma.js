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

module.exports = function (grunt) {
    var _ = grunt.util._;

    grunt.registerMultiTask('karma', 'run karma.', function () {
        var done = this.async();
        var options = this.options({
            background: false,
            // allow passing of cli args on as client args, for example --grep=x
            clientArgs: require('optimist').argv,
            client: { args: require('optimist').argv }
        });

        //console.log("\n------------ karam.config:\n", this);
        //_.each(this.files, function(file) {console.log("file:",file);});

        //console.log("\n--------options\n",options);
        //_.each(options.files, function(file) {console.log("file:",file);});

        //console.log("\n--------data\n",config);
        //_.each(config.files, function(file) {console.log("file:",file);});

        displayDebugLog(false,"--------------------\nPRE merged data -------\n" + displayConfig(this.data) + "\n======================\n");
        displayDebugLog(false,"--------------------\nPRE merged options -------\n" + displayConfig(options) + "\n======================\n");

        var files = undefined
        if (this.data.nestedFileMerge != false) {
            // Merge karma config files property from global options and specified target options
            // expanding each file entry:
            // this supports filtered selections [ 'path/**/*.js', '!path/**/*.spec.js' ]
            // caveat: files created after karma server is started will not be included or watched.
            files = mergeFilePatterns(grunt, this.data, options);

            //console.log("expanded config ----\n", config, "\n========\n");
        }
        //displayDebugLog(false,"--------------------\nPOST expanded options -------\n" + displayConfig(options) + "\n======================\n");

        //merge options onto config, with config taking precedence
        var config = _.merge(options, this.data);

        config.target = this.target;

        if (files) {
            config.files = files
        }

        displayDebugLog(config.debug, "--------------------\nPOST merged options + data -------\n" + displayConfig(config) + "\n======================\n");

        //config.files.forEach(function(it) {console.log("loading ",it);});
        if (config.configFile) {
            config.configFile = path.resolve(config.configFile);
            config.configFile = grunt.template.process(config.configFile);

            //console.log("loaded config ----\n", config, "\n========\n");
        }


        //console.log("\n-------- processed config:\n", config);

        //_.each(config.files, function(file) {console.log("file:",file.pattern ? file.pattern : file);});

        if (this.flags.run) {
            //support `karma run`, useful for grunt watch
            runKarma(grunt, config, done);
        }
        else if (config.background) {
            //allow karma to be run in the background so it doesn't block grunt
            spawnKarma(grunt, config, done);
        }
        else {
            // start a new karma server and run tests.
            startKarmaServer(grunt, config, done)
        }
    });
};


function runKarma(grunt, config, done) {
    console.log("\nkarma.runner.run(...)");
    runner.run(config, function (code) {
        console.log('\n', config.target, 'Tests Complete...');
        done(code);
    });
}

function spawnKarma(grunt, config, done) {
    //allow karma to be run in the background so it doesn't block grunt
    console.log("\ngrunt.util.spawn(karma.server.start(...))");
    grunt.util.spawn({cmd: 'node', args: [path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(config)]}, function () {});
    console.log('\n', config.target, 'Tests Complete...');
    done();
}

function startKarmaServer(grunt, config, done) {
    var asyncComplete = function (code) {
        console.log('\n', config.target, 'Tests Complete...');
        return done(code === 0);
    };
    console.log("\nkarma.server.start(...)");
    server.start(config, asyncComplete);
}

function displayDebugLog(debug, out) {
    if (!debug)
        return "-- turn on debug mode to see config options --"

    console.log(out)
}

var indent=""
function displayConfig(data) {

    var output = "";
    for(var property in data){
        var value = data[property];
        if (value != null) {
            output += indent + "'" + property + "': ";
            if (data[property] instanceof  Array) {
                output += "[\n";
                indent += "   ";
                for (var i = 0; i < data[property].length; i++) {
                    output += indent + JSON.stringify(data[property][i]) + ",\n"
                }
                indent = indent.substring(0,indent.length - 3);
                output = output.substring(0,output.length - 2) + "\n" + indent + "]\n"
            }
            else if (typeof value === 'object') {
                output += JSON.stringify(value) + "\n";
            }
            else {
                output += value + "\n";
                //alert(propt + ': ' + obj[propt]);
            }
        }
    }
    //return JSON.stringify(data)
    return output
}

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
