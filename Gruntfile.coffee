module.exports = (grunt) ->

  plugins = ['karma-mocha']
  browsers = []

  # Set proper browser depending if we are on travis or not
  if (process.env.TRAVIS)
    plugins.push 'karma-firefox-launcher'
    browsers.push 'Firefox'
  else
    plugins.push 'karma-chrome-launcher'
    browsers.push 'Chrome'


  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    pkgFile: 'package.json'

    files: [
      'lib/*.js'
      'tasks/*.js'
      'test/*.js'
    ]


    # JSHint options
    # http://www.jshint.com/options/
    jshint:
      all:
        files:
          src: '<%= files %>'
        options:
          browser: true,
          strict: false
          undef: false
          camelcase: false

      options:
        quotmark: 'single'
        camelcase: true
        strict: true
        trailing: true
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        boss: true
        globals: {}

    jscs:
      all:
        files: src: '<%= files %>'
      options:
        config: '.jscs.json'

    'npm-publish':
      options:
        abortIfDirty: true

    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

    bump:
      options:
        updateConfigs: ['pkg']
        commitFiles: ['package.json', 'CHANGELOG.md']
        commitMessage: 'chore: release v%VERSION%'
        pushTo: 'upstream'
        push: false
        gitDescribeOptions: '| echo "beta-$(git rev-parse --short HEAD)"'

    karma:
      # all of the targets will use/override these options
      options:
        browsers: browsers
        frameworks: ['mocha']
        plugins: plugins

      single:
        singleRun: true
        files: [
          {src: 'node_modules/expect.js/index.js'}
          {src: 'test/**/*.js'}
        ]

      config:
        configFile: 'karma.conf.js'
        singleRun: true

      merge:
        options:
          files: [
            'node_modules/expect.js/index.js'
          ]
        singleRun: true
        files: [
          {src: 'test/**/*.js'}
        ]

      # watch using grunt-watch
      dev:
        reporters: 'dots'
        background: true

      # watch using karma
      auto:
        autoWatch: true

    watch:
      tests:
        files: 'test/**/*.js',
        tasks: ['karma:dev:run']

  # Load karma plugin
  grunt.loadTasks 'tasks'

  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-jscs-checker'
  grunt.loadNpmTasks 'grunt-npm'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-auto-release'
  grunt.loadNpmTasks 'grunt-conventional-changelog'

  grunt.registerTask 'test', ['karma:single', 'karma:config', 'karma:merge']
  grunt.registerTask 'default', ['jshint', 'jscs', 'test']
  grunt.registerTask 'release', 'Bump the version and publish to npm.', (type) ->
    grunt.task.run [
      'npm-contributors'
      "bump:#{type||'patch'}:bump-only"
      'changelog'
      'bump-commit'
      'npm-publish'
    ]
