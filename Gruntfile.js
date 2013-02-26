/*
 * gruntacular
 * https://github.com/OpenWebStack/gruntacular
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.initConfig({
    testacular: {
      options: {
        configFile: 'testacular.conf.js',
        browsers: ['Chrome']
      },
      continuous: {
        singleRun: true
      },
      dev: {
        reporters: 'dots'
      }
    },

    watch: {
      tests: {
        files: 'test/**/*.js',
        tasks: ['testacular:dev:run']
      }
    }
  });

  //Load gruntacular plugin
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['testacular:continuous']);
};