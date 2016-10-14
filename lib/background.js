var Server = require('karma').Server

process.on('message', function (data) {
  var server = new Server(data.config)
  server.start()

  if (data.config.backgroundServerEvents && data.config.backgroundServerEvents.length) {
    for (var i = 0; i < data.config.backgroundServerEvents.length; i++) {
      var event = data.config.backgroundServerEvents[i]

      /**
       * add event listener to Server.
       *
       * Example:
       * server.on('run_complete', function() {
       *   ...
       * }
       */
      server.on(event, function () {
        /**
         * Different events return a different set of
         * arguments. Capture all arguments.
         *
         * See http://karma-runner.github.io/1.0/dev/public-api.html
         */
        var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments))

        var result = {

          // Example: 'run_complete'
          event: event,

          // Example: [browsers, results]
          data: args
        }

        process.send(result)
      })
    }
  }
})
