var runner = require('testacular').runner;
var server = require('testacular').server;

module.exports = function(grunt) {
  grunt.registerMultiTask('testacular', 'run testacular.', function() {
    var done = this.async();
    if (this.data.configFile) {
      this.data.configFile = grunt.template.process(this.data.configFile);
    }
    //support `testacular run`, useful for grunt watch
    if (this.flags.run){
      runner.run(this.data, finished.bind(done));
      return;
    }
    server.start(this.data, finished.bind(done));
  });
};

function finished(code){ return this(code === 0); }