//TODO make the configFile optional
frameworks = ['mocha'];

files = [
  'node_modules/expect.js/expect.js',
  'test/**/*.js'
];

plugins = ['karma-mocha', 'karma-chrome-launcher'];
