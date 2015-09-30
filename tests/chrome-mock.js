chrome = {storage: {sync: {}}};

chrome.storage.sync.data = {};
chrome.storage.sync.get = function(key, callback) {
    callback(chrome.storage.sync.data);
};
chrome.storage.sync.set = function(data) {
    for (var key in data) {
        chrome.storage.sync.data[key] = data[key];
    }
};
