describe('Environment switcher:', function() {

    "use strict";

    beforeEach(function() {
        browser.get('#/');
    });

    // Modal dialog appears and disappears with a transition.
    var delay = 1000;

    function expectText(element, selector) {
        if (selector) {
            element = element.element(by.css(selector));
        }
        return expect(element.getText());
    }

    function expectDisplayed(element, selector) {
        if (selector) {
            element = element.element(by.css(selector));
        }
        return expect(element.isDisplayed());
    }

    function click(element, selector) {
        if (selector) {
            element = element.element(by.css(selector));
        }
        element.click();
        browser.sleep(delay);
    }

    function submit(element, selector) {
        if (selector) {
            element = element.element(by.css(selector));
        }
        element.submit();
        browser.sleep(delay);
    }

    var projects = ['Foo', 'Bar', 'Baz'];

    var sidebar = {
        createNewProjectButton: element(by.css('.sidebar .create-new-project')),
        projectsButtons: element.all(by.css('.sidebar .projects li')),
        globalActionsLinks: element.all(by.css('.sidebar #global-actions li'))
    };

    var projectForm = {
        nameField: element(by.id('project-name')),
        createNewEnvironmentButton: element(by.css('.create-new-environment button')),
        environmentsTable: element(by.id('project-environments')),
        createNewLinkButton: element(by.css('.create-new-link button')),
        linksTable: element(by.id('project-links'))
    };

    var removeProjectForm = {
        wrapper: element(by.id('project-delete-confirm')),
        closeButton: element(by.css('#project-delete-confirm .close-link.close-modal')),
        deleteButton: element(by.id('delete-project')),
        cancelButton: element(by.id('close-delete-project-form'))
    };

    var environmentForm = {
        wrapper: element(by.id('environment-form')),
        statusCheckbox: element(by.css('#environment-form .switch label')),
        nameField: element(by.model('ctrl.environment.name')),
        baseUrlField: element(by.model('ctrl.environment.baseUrl')),
        closeButton: element(by.css('#environment-form .close-link.close-modal')),
        deleteButton: element(by.id('delete-environment')),
        cancelButton: element(by.id('close-environment-form'))
    };

    var linkForm = {
        wrapper: element(by.id('link-form')),
        textField: element(by.model('ctrl.link.text')),
        urlField: element(by.model('ctrl.link.url')),
        deleteButton: element(by.id('delete-link'))
    };

    it('App initialization', function() {

        expect(browser.getTitle()).toEqual('Environments');
        expectText(sidebar.createNewProjectButton).toBe('Create new project');

        expect(sidebar.projectsButtons.count()).toBe(3);
        expectText(sidebar.projectsButtons.get(0)).toBe('Foo');
        expectText(sidebar.projectsButtons.get(1)).toBe('Bar');
        expectText(sidebar.projectsButtons.get(2)).toBe('Baz');

        expect(sidebar.globalActionsLinks.count()).toBe(3);
        expect(sidebar.globalActionsLinks.get(0).getAttribute('title')).toBe('Export projects');
        expect(sidebar.globalActionsLinks.get(1).getAttribute('title')).toBe('Import projects');
        expect(sidebar.globalActionsLinks.get(2).getAttribute('title')).toBe('Open source code');

    });

    it('Project switcher', function() {
        for (var i = 0; i < 3; i++) {
            var projectButton = sidebar.projectsButtons.get(i);
            projectButton.click();
            expect(projectButton.element(by.css('.active')).getText()).toBe("×\n" + projects[i]);
            expect(projectForm.nameField.getAttribute('value')).toBe(projects[i]);
        }
    });

    it('Project creation', function() {
        sidebar.createNewProjectButton.click();
        expect(projectForm.nameField.getAttribute('value')).toBe('New project');
        projectForm.nameField.clear().sendKeys('Example');
        expectText(sidebar.projectsButtons.first()).toBe('Example');
        expectText(projectForm.environmentsTable, 'tbody tr:nth-child(1)').toBe('No environments were found.');

        click(projectForm.createNewEnvironmentButton);
        expect(environmentForm.wrapper.isDisplayed()).toBeTruthy();
        environmentForm.nameField.sendKeys('Localhost');
        environmentForm.baseUrlField.sendKeys('http://example.local');
        submit(environmentForm.wrapper, 'form');
        expectText(projectForm.environmentsTable, 'tbody tr').toBe('Localhost http://example.local Enabled Edit');
        expectText(projectForm.linksTable, 'tbody td').toBe('No links were found.');

        click(projectForm.createNewLinkButton);
        expect(linkForm.wrapper.isDisplayed()).toBeTruthy();
        linkForm.textField.sendKeys('Wiki');
        linkForm.urlField.sendKeys('http://redmine.local/projects/example/wiki');
        linkForm.wrapper.element(by.css('form')).submit();
        expectText(projectForm.linksTable, 'tbody tr').toBe('Wiki http://redmine.local/projects/example/wiki Edit');

    });

    it('Project edition', function() {
        sidebar.projectsButtons.get(0).click();

        projectForm.nameField.clear().sendKeys('Foo updated');
        expect(sidebar.projectsButtons.get(0).getText()).toBe("×\nFoo updated");
        expectText(sidebar.projectsButtons.get(0)).toBe("×\nFoo updated");

        click(projectForm.environmentsTable, 'tbody tr:nth-child(1) td:nth-child(4) span');

        environmentForm.statusCheckbox.click();
        environmentForm.nameField.sendKeys(' - updated');
        environmentForm.baseUrlField.sendKeys('-updated');
        submit(environmentForm.wrapper, 'form');
        expectText(projectForm.environmentsTable, 'tbody tr:nth-child(1)').toBe('Production - updated http://foo.prod-updated Disabled Edit');

        click(projectForm.environmentsTable, 'tbody tr:nth-child(1) td:nth-child(4) span');
        expectDisplayed(environmentForm.wrapper).toBeTruthy();
        click(environmentForm.closeButton);
        expectDisplayed(environmentForm.wrapper).toBeFalsy();
        click(projectForm.environmentsTable, 'tbody tr:nth-child(1) td:nth-child(4) span');
        expectDisplayed(environmentForm.wrapper).toBeTruthy();
        click(environmentForm.cancelButton);
        expectDisplayed(environmentForm.wrapper).toBeFalsy();
        click(projectForm.environmentsTable, 'tbody tr:nth-child(1) td:nth-child(4) span');
        click(environmentForm.deleteButton);
        expectText(projectForm.environmentsTable, 'tbody tr:nth-child(1)').not.toBe('Production - updated http://foo.prod-updated Disabled Edit');

        click(projectForm.linksTable, 'tbody tr:nth-child(1) td:nth-child(3) span');
        linkForm.textField.sendKeys(' - updated');
        linkForm.urlField.sendKeys('-updated');
        submit(linkForm.wrapper, 'form');
         expectText(projectForm.linksTable, 'tbody tr:nth-child(1)').toBe('Wiki - updated http://projects.com/foo/wiki-updated Edit');
        click(projectForm.linksTable, 'tbody tr:nth-child(1) td:nth-child(3) span');
        linkForm.deleteButton.click();
        expectText(projectForm.linksTable, 'tbody tr:nth-child(1)').not.toBe('Wiki - updated http://projects.com/foo/wiki-updated Edit');
    });

    it('Project deletion', function() {

        click(sidebar.projectsButtons.get(0));
        click(sidebar.projectsButtons.get(0), '.delete-project-link');
        expectDisplayed(removeProjectForm.wrapper).toBeTruthy();
        click(removeProjectForm.cancelButton);
        expectDisplayed(removeProjectForm.wrapper).toBeFalsy();
        click(sidebar.projectsButtons.get(0));
        click(sidebar.projectsButtons.get(0), '.delete-project-link');
        expectDisplayed(removeProjectForm.wrapper).toBeTruthy();

        click(removeProjectForm.closeButton);
        expectDisplayed(removeProjectForm.wrapper).toBeFalsy();

        expect(sidebar.projectsButtons.count()).toBe(projects.length);
        for (var i = 0; i <= 2; i++) {
            expectText(sidebar.projectsButtons.get(0)).toBe(projects[i]);
            click(sidebar.projectsButtons.get(0));
            click(sidebar.projectsButtons.get(0), '.delete-project-link');
            click(removeProjectForm.deleteButton);
            expect(sidebar.projectsButtons.count()).toBe(2 - i);
        }
    });

    it('Export', function() {
        var fs = require('fs');

        var mockFile = 'tests/projects-mock.js';
        var mockData = fs.readFileSync(mockFile, { encoding: 'utf8' });

        var exportedFile = '/tmp/es-projects.json';

        if (fs.existsSync(exportedFile)) {
            // Make sure the browser doesn't have to rename the download.
            fs.unlinkSync(exportedFile);
        }
        sidebar.globalActionsLinks.get(0).click();

        browser.driver.wait(function() {
            return fs.existsSync(exportedFile);
        }, 1000).then(function() {
            var exportedData = fs.readFileSync(exportedFile, { encoding: 'utf8' });
            expect('var mockProjects = ' + exportedData + ";\n").toEqual(mockData);
        });

    });


    it('Import', function() {
        var path = require('path');

        sidebar.globalActionsLinks.get(1).click();

        var uploadFile = element(by.css('input[type="file"]'));
        var mockFile = 'projects-mock.json';
        var absolutemockFile = path.resolve(__dirname, mockFile);

        uploadFile.sendKeys(absolutemockFile);

        expect(sidebar.projectsButtons.count()).toBe(1);
        expectText(sidebar.projectsButtons.get(0)).toBe('Foo mock');
        sidebar.projectsButtons.get(0).click();
        expect(projectForm.nameField.getAttribute('value')).toBe('Foo mock');
        expectText(projectForm.environmentsTable, 'tbody tr').toBe('Localhost (mock) http://foo-mock.local Enabled Edit');
        expectText(projectForm.linksTable, 'tbody tr').toBe('Wiki http://projects-mock.com/foo/wiki Edit');

    });

    it('Github link', function() {
        sidebar.globalActionsLinks.get(2).click();
        browser.ignoreSynchronization = true;
        expect(browser.getTitle()).toEqual('Chi-teck/environment-switcher · GitHub');
    });

});
