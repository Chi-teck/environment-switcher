async function getCurrentUrl() {
    let queryOptions = {active: true, currentWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}


function clickHandler(event) {
    const tabOptions = {url:  event.target.dataset.url};
    event.ctrlKey || event.type === 'auxclick' ?
        chrome.tabs.create(tabOptions) :
        chrome.tabs.update(null, tabOptions);
    window.close();
}

function createItem(label, url, attributes) {
    const li = document.createElement('li');
    const button = document.createElement('button')
    button.innerHTML = label;
    button.dataset.url = url;
    button.addEventListener('click', clickHandler)
    button.addEventListener('auxclick', clickHandler)
    li.appendChild(button);
    return li;
}

async function init(data) {
    const projects = data.projects || [];

    const findProject = function (url) {
        const checkEnvironment = environment => url.origin === environment.baseUrl;
        const checkProject = project => project.environments.find(checkEnvironment);
        return projects.find(checkProject);
    }

    const currentUrl = new URL(await getCurrentUrl());
    const project = findProject(currentUrl);

    const $list = document.createElement('ul');
    $list.setAttribute('id', 'environments');

    if (project) {
        project.environments.forEach(environment => {
            const item = $list.appendChild(
                createItem(environment.name, environment.baseUrl +  currentUrl.pathname)
            );
            if (currentUrl.origin === environment.baseUrl) {
                item.classList.add('active');
            }
        })
    }


    let path = 'options/index.html';
    if (project) {
       path += '#/project/' + project.id
    }
    const item = $list.appendChild(createItem('Options', chrome.runtime.getURL(path)));
    item.classList.add('options');


    document.body.appendChild($list);
}





chrome.storage.sync.get().then(init);


chrome.storage.sync.get('projects', function (data) {

    'use strict';

    return;

    var projects = data.projects || [];

    console.log(projects);


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

            if (i > 0) {
                li = document.createElement('li');
                li.setAttribute('class', 'separator');
                items.push(li);
            }
        }

        li = document.createElement('li');
        var path = 'options/index.html';
        if (project) {
            path += '#/project/' + project.id;
        }
        li.setAttribute('data-url', chrome.runtime.getURL(path));;
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
