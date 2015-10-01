chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if (changeInfo.status == 'loading') {
        chrome.pageAction.show(tabId);
    }

});

