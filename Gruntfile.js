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
    }
  });

  //Load gruntacular plugin
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['testacular:continuous']);
};