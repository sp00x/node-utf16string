module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescriptUsingTsConfig: {
      basic: {
        options: {
          rootDir: "./" // optional 
        }
      }
    },
    browserify: {
      browser: {
        src: 'src_browserify/bundle.js',
        dest: 'dist_browserify/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.author %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'dist_browserify/<%= pkg.name %>.js',
        dest: 'dist_browserify/<%= pkg.name %>.min.js'
      }
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-typescript-using-tsconfig');
  grunt.loadNpmTasks('grunt-browserify');

  // tasks
  //grunt.registerTask('default', ['typescriptUsingTsConfig', 'browserify', 'uglify']);
  grunt.registerTask('build', ['typescriptUsingTsConfig', 'browserify', 'uglify']);
};