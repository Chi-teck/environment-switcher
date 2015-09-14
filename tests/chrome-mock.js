chrome = {};
chrome.storage = {};

chrome.storage.sync = {data: {projects: []}};
chrome.storage.sync.get = function(key, callback) {
    callback(chrome.storage.sync.data[key]);
};


