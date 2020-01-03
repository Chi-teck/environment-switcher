chrome.storage.local.get('projects', function (data) {

    'use strict';

    var projects = data.projects || [];

    function findProject(url) {
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            for (var j = 0; j < project.environments.length; j++) {
                var environment = project.environments[j];
                if (url.indexOf(environment.baseUrl) != -1) {
                    environment.active = true;
                    return project;
                }
            }
        }
    }

    /**
     * Navigates to new URL.
     *
     * @param url
     *   URL to navitage.

     * @param create
     *   Whether to open the URL in a new tab. Indicates that CTRL was held down
     *   during the click or middle button was clicked.
     */
    function navigate(url, create) {
        var tabOptions = {url: url};
        create ?
            chrome.tabs.create(tabOptions) :
            chrome.tabs.update(null, tabOptions);
         window.close();
    }

    function init(tabs) {
        var tab = tabs[0];

        var project = findProject(tab.url);

        var baseUrl, li, i;

        var listWrapper = document.createElement('ul');
        listWrapper.setAttribute('id', 'environments');

        var items = [];
        if (project) {

            // Create list of available environments.
            for (i = 0; i < project.environments.length; i++) {
                var environment = project.environments[i];
                if (environment.status) {
                    li = document.createElement('li');
                    li.setAttribute('data-base-url', environment.baseUrl);
                    li.setAttribute('class', 'environment');
                    li.innerHTML = environment.name;
                    if (environment.active) {
                        li.classList.add('active');
                        baseUrl = environment.baseUrl;
                    }
                    items.push(li);
                }
            }

            if (i > 0) {
                li = document.createElement('li');
                li.setAttribute('class', 'separator');
                items.push(li);
            }

            for (i = 0; i < project.links.length; i++) {
                var link = project.links[i];
                li = document.createElement('li');
                li.setAttribute('data-url', link.url);
                li.setAttribute('class', 'link');
                if (i == 0) {
                    li.classList.add('first');
                }
                li.innerHTML = link.text;
                items.push(li);
            }

            if (i > 0) {
                li = document.createElement('li');
                li.setAttribute('class', 'separator');
                items.push(li);
            }
        }

        li = document.createElement('li');
        var path = 'options/options.html';
        if (project) {
            path += '#/project/' + project.id;
        }
        li.setAttribute('data-url', chrome.extension.getURL(path));
        li.setAttribute('class', 'options');
        li.innerHTML = 'Options';
        items.push(li);

        items.forEach(function (item) {
            listWrapper.appendChild(item);
        });


        listWrapper.addEventListener('click', function (e) {
            var url, item = e.target;
            if (item.tagName == 'LI') {

                var environmentBaseUrl = item.getAttribute('data-base-url');
                if (environmentBaseUrl) {
                    document
                        .getElementsByClassName('active')[0]
                        .classList
                        .remove('active');
                    item.classList.add('active');
                    url = tab.url.replace(baseUrl, environmentBaseUrl);
                }
                else {
                    url = item.getAttribute('data-url');
                }

                navigate(url,  e.ctrlKey || e.button == 1);
            }

        });

        document.body.appendChild(listWrapper);
    }

    chrome.tabs.query({active: true, currentWindow: true}, init);
});
