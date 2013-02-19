/*
 * gruntacular
 * https://github.com/OpenWebStack/gruntacular
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    testacular: {
      continuous: {
        configFile: 'testacular.conf.js',
        singleRun: true,
        browsers: ['Chrome']
      },
      dev: {
        configFile: 'testacular.conf.js',
        browsers: ['Chrome']
      }
    }
  });

  //Load gruntacular plugin
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['testacular:continuous']);
};