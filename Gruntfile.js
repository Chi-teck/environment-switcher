module.exports = function (grunt) {

    var projectFiles = [
        'manifest.json',
        'popup/*',
        'options/*',
        'background/*',
        'images/16.png',
        'images/32.png',
        'images/64.png'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/*'],
        copy: {
            main: {
                files: [
                    {expand: true, src: projectFiles, dest: 'dist/'}
                ]
            }
        },
        concat: {
            js: {
                src: [
                    'vendor/jquery/dist/jquery.min.js',
                    'vendor/foundation/js/vendor/modernizr.js',
                    'vendor/foundation/js/foundation.min.js',
                    'vendor/angular/angular.min.js',
                    'vendor/angular-route/angular-route.min.js'
                ],
                dest: 'dist/vendor.js'
            },
            css: {
                src: [
                    'vendor/foundation/css/foundation.css',
                    'vendor/jquery-ui/themes/smoothness/jquery-ui.min.css'
                ],
                dest: 'dist/vendor.css'
            }
        },
        processhtml: {
            dist: {
                files: {
                    'dist/options/options.html': ['dist/options/options.html']
                }
            }
        },
        crx: {
            "environment-switcher": {
                "src": "dist",
                "dest": "dist/environment-switcher.crx",
                "privateKey": "~/.ssh/test-key.pem"
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-processhtml');
    //grunt.loadNpmTasks('grunt-crx');

    var defaultTasks = [
        'clean',
        'copy',
        'concat',
        'processhtml',
        'crx'
    ];
    grunt.registerTask('default', defaultTasks);
};
