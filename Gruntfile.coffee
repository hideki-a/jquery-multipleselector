'use strict'
LIVERELOAD_PORT = 35729
lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT })
mountFolder = (connect, dir) ->
  return connect.static(require('path').resolve(dir))

module.exports = (grunt) ->
  # Load grunt tasks.
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  # Initialize configuration.
  grunt.initConfig
    compass:
      dev:
        reference:
          'examples/css': 'examples/_scss'
        options:
          config: 'config.rb'
          environment: 'development'

      dist:
        reference: '<%= compass.dev.reference %>'
        options:
          config: 'config.rb'
          environment: 'production'
          force: true

    connect:
      livereload:
        options:
          hostname: '0.0.0.0'
          port: 8080
          middleware: (connect, options) ->
            return [
              lrSnippet
              mountFolder(connect, './')
            ]

    watch:
      options:
        nospawn: true
        livereload: true

      compass:
        files: 'examples/_scss/*.scss'
        tasks: ['compass:dev']

      static:
        files: [
          'examples/*.html'
          'src/*.js'
        ]

    jshint:
      options:
        jshintrc: '.jshintrc'
      all: [
        'src/*.js'
      ]

    uglify:
      options:
        preserveComments: 'some'
      dist:
        files:
          'dist/jquery.multipleselector.min.js': ['src/jquery.multipleselector.js']

    growl:
      notify: true

  # Register tasks.
  grunt.registerTask 'develop', [
    'compass:dev'
    'connect:livereload'
    'watch'
  ]

  grunt.registerTask 'deploy', [
    'jshint'
    'uglify'
  ]

  return;