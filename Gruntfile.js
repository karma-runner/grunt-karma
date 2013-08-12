'use strict';

module.exports = function(grunt) {

  /******************************************************************************
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install --save-dev` in this directory.
   ******************************************************************************/
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      options: {
        browsers: ['Chrome'],
        files: ['node_modules/expect.js/expect.js'],
        frameworks: ['mocha'],
        plugins: ['karma-mocha', 'karma-chrome-launcher']
      },
      continuous: {
        files: [{pattern: 'test/**/*.js', watched: false} ],
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
