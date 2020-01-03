chrome = {storage: {sync: {}}};

chrome.storage.local.data = {};
chrome.storage.local.get = function(key, callback) {
    callback(chrome.storage.local.data);
};
chrome.storage.local.set = function(data) {
    for (var key in data) {
        chrome.storage.local.data[key] = data[key];
    }
};
