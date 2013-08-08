'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      options: {
        browsers: ['Chrome'],
        files: [
          'node_modules/expect.js/expect.js'
        ],
        frameworks: ['mocha'],
        plugins: ['karma-mocha', 'karma-chrome-launcher']
      },
      continuous: {
        files: [{pattern: 'test/**/*.js', watched: true} ],
        singleRun: true
      },
      dev: {
          files: [{pattern: 'test/**/*.js', watched: true} ],
          reporters: 'dots',
        // clientArgs: ["--grep", true]
        background: true
      }
    },

    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    },

    watch: {
      tests: {
        files: 'test/**/*.js',
        tasks: ['karma:dev:run']
      }
    },

    release: {
      options: {
        npmtag: true
      }
    }

  });

  //Load karma plugin
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['karma:continuous']);
};
