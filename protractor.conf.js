exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: 'http://localhost:8000/dist/options/options.html?',
    capabilities: {
        browserName: 'chrome',
        'chromeOptions': {
            args: ['--no-sandbox', '--test-type=browser'],
            prefs: {
                'download': {
                    'default_directory': '/tmp'
                }
            }
        }
    },
    specs: ['tests/protractor-spec.js'],
    jasmineNodeOpts: {
        showColors: true
    }
};
