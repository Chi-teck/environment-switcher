module.exports = function (grunt) {

    var projectFiles = [
        'manifest.json',
        'popup/*',
        'options/*',
        'background/*',
        'images/*.png'
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
            },
            test: {
                files: {
                    'dist/options/options.html': ['dist/options/options.html']
                }
            }
        },
        jshint: {
            beforeconcat: ['options/options.js', 'popup/popup.js', 'background/background.js'],
            options: {
                validthis: true,
                //"-W041": false
            }
        },
        crx: {
            "environment-switcher": {
                "src": "dist",
                "dest": "dist/environment-switcher.crx",
                "privateKey": "~/.ssh/test-key.pem"
            }
        },
        protractor: {
            options: {
                configFile: "protractor.conf.js", // Default config file
                keepAlive: true, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {
                    // Arguments passed to the command
                }
            },
            your_target: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
                options: {
                    configFile: "protractor.conf.js", // Target-specific config file
                    args: {} // Target-specific arguments
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-crx');
    grunt.loadNpmTasks('grunt-protractor-runner');

    var defaultTasks = [
        'clean',
        'copy',
        'concat',
        'processhtml',
        //'jshint'
        //'crx'
    ];
    grunt.registerTask('default', defaultTasks);

    var testTasks = [
        'clean',
        'copy',
        'concat',
        'processhtml',
        'protractor'
    ];
    grunt.registerTask('test', testTasks);

};
