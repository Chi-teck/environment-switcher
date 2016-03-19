module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/*'],
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: [
                            'manifest.json',
                            'popup/*',
                            'options/*',
                            'background/*',
                            'images/*.png'
                        ],
                        dest: 'dist/'
                    }
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
                "-W041": false
            }
        },
        crx: {
            'environment-switcher': {
                src: 'dist',
                dest: 'dist/environment-switcher.crx',
                privateKey: '~/.ssh/test-key.pem'
            }
        },
        'http-server': {
            dev: {
                port: 8000,
                host: '127.0.0.1',
                // Do not log requests.
                logFn: function(req, res, error) {},
                runInBackground: true
            }
        },

        protractor_webdriver: {
            dev: {
                options: {
                    path: ''
                }
            }
        },
        protractor: {
            options: {
                configFile: "protractor.conf.js",
                keepAlive: true,
                noColor: false,
                args: {}
            },
            dev: {
                options: {
                    configFile: "protractor.conf.js",
                    args: {}
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
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-protractor-webdriver');

    var defaultTasks = [
        'clean',
        'copy',
        'concat',
        'processhtml:dist',
        //'jshint'
         'crx'
    ];
    grunt.registerTask('default', defaultTasks);

    var testTasks = [
        'http-server',
        'clean',
        'copy',
        'concat',
        'processhtml:test',
        // @TODO: Find a way to start webdriver automatically.
        //'protractor_webdriver',
        'protractor'
    ];
    grunt.registerTask('test', testTasks);

};
