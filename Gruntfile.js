// use as:  grunt karma:dev for continuous testing or
//          grunt karma:unit to just run the test once
//          grunt test-server to display the test runner page

module.exports = function(grunt) {
  var path = require('path');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lint-inline');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
        configFile: 'conf/karma.conf.js',
        singleRun: true,
        browsers: ['Firefox']
      },
      ci: {
        configFile: 'conf/karma.conf.js',
        singleRun: true,
        browsers: ['Firefox']
      },
      dev: {
        configFile: 'conf/karma.conf.js',
        singleRun: false,
        browsers: ['Firefox']
      },
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: __dirname+'/../',
          keepalive: true,
          open: 9001+'/'+path.basename(__dirname)+'/index.html'
        }
      }
    },
    csslint: {
      lax: {
        options: {
          "adjoining-classes": false,
          "box-model": false,
          "box-sizing": false,
          "bulletproof-font-face": false,
          "compatible-vendor-prefixes": false,
          "ids": false,
          "important": false,
          "outline-none": false,
          "overqualified-elements": false,
          "qualified-headings": false,
          "regex-selectors": false,
          "star-property-hack": false,
          "underscore-property-hack": false,
          "universal-selector": false,
          "unique-headings": false,
          "unqualified-attributes": false,
          "vendor-prefix": false,
          "zero-units": false
        },
        src: [
          "component.css"
        ]
      },
    },
    jshint: {
      options: {
        "-W054": true,  // The Function constructor is a form of eval
        "-W069": true   // thing["property"] is better written in dot notation
      },
      files: [
        "Gruntfile.js",
        "test/**/*.js"
      ]
    },
    inlinelint: {
      html: ['index.html', 'component.html', 'test/**/*.html'],
    }
  });

  grunt.registerTask('lint', 'check the code', ["inlinelint", "jshint", "csslint"]);
  grunt.registerTask('test-server', 'start web server for tests in browser', function() {
    grunt.event.once('connect.server.listening', function(host, port) {
      var specRunnerUrl = 'http://' + host + ':' + 9001+'/'+path.basename(__dirname)+'/index.html';
      grunt.log.writeln('test runner available at: ' + specRunnerUrl);
      require('open')(specRunnerUrl);
    });

    grunt.task.run('connect:server');
  });
  grunt.registerTask('default', 'help message', function() {
    grunt.log.writeln('\n\nRun:\n\'grunt karma:dev\' for continuous testing');
    grunt.log.writeln('\'grunt karma:unit\' to just run the test once');
    grunt.log.writeln('\'grunt test-server\' to display the test runner page');
    grunt.log.writeln('\'grunt lint\' to check the code');
  });
  // grunt.registerTask('default', ['connect']);
};
