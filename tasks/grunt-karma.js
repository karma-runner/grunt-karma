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

    var cliOptions = processKarmaCliArgs(require('optimist').argv);

    var data = this.data;
    //merge options onto data and cliOptions
    data = _.merge(options, data, cliOptions);

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
      grunt.util.spawn({cmd: 'node', args: [path.join(__dirname, '..', 'lib', 'background.js'), JSON.stringify(data)]}, function(){});
      done();
    }
    else {
      server.start(data, finished.bind(done));
    }
  });
};

function finished(code){ return this(code === 0); }

var KARMA_LOG_LEVELS = {
  LOG_DISABLE : 'OFF',
  LOG_ERROR   : 'ERROR',
  LOG_WARN    : 'WARN',
  LOG_INFO    : 'INFO',
  LOG_DEBUG   : 'DEBUG'
};

var karmaCliOptions = {
  'autoWatch'       : bool,
  'browsers'        : stringCommaSep,
  'colors'          : bool,
  'logLevel'        : function(val){
    return KARMA_LOG_LEVELS['LOG_' + val.toUpperCase()] || KARMA_LOG_LEVELS.LOG_DISABLE;
  },
  'port'            : function(val){return val;},
  'reporters'       : stringCommaSep,
  'singleRun'       : bool,
  'reportSlowerThan': function(val) {
    return val === false ? 0: val;
  }
};


function processKarmaCliArgs(argv) {
  var cliOptions = {};

  Object.getOwnPropertyNames(argv).forEach(function(name) {
    if (name == '_' || name == '$0') {
      return;
    }

    var optionName = dashToCamel(name);
    if(typeof karmaCliOptions[optionName] != 'function') {
      return;
    }

    cliOptions[optionName] = karmaCliOptions[optionName](argv[name]);
  });
  return cliOptions;
}

// helpers
function ucFirst(word) {
  return word.charAt(0).toUpperCase() + word.substr(1);
}

function dashToCamel(dash) {
  var words = dash.split('-');
  return words.shift() + words.map(ucFirst).join('');
}

function bool(val) {
  if(typeof val == 'string') {
    return val == 'true';
  }
  return val;
}

function stringCommaSep(val) {
  return val.split(',');
}
