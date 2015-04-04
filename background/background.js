chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if (changeInfo.status == 'loading') {
        console.log(tab.url);
        chrome.pageAction.show(tabId);
    }

});

