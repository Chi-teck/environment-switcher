(function () {

    'use strict';

    var app = angular.module('app', ['ngRoute']);

    //--
    app.config(['$routeProvider', routeConfig]);
    function routeConfig($routeProvider) {

        function projectStorageResolver() {
            return {
                projectStorageInit: ['projectStorage', '$route', '$filter', '$q', function (projectStorage, $route, $filter, $q) {
                    return projectStorage.init();
                }]
            };
        }

        $routeProvider
            .when('/project/:projectId', {
                templateUrl: 'project-form.html',
                controller: 'projectForm as ctrl',
                resolve: projectStorageResolver()
            })
            .when('/project/:projectId/create-environment', {
                templateUrl: 'environment-form.html',
                controller: 'environmentForm as ctrl',
                resolve: projectStorageResolver()
            })
            .when('/project/:projectId/:environmentId', {
                templateUrl: 'environment-form.html',
                controller: 'environmentForm as ctrl',
                resolve: projectStorageResolver()
            })
            .otherwise({redirectTo: '/'});
    }

    //--
    app.config(['$compileProvider', compileConfig]);
    function compileConfig($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|chrome-extension):/);
    }

    //--
    app.filter('enabledDisabled', enabledDisabledFilter);
    function enabledDisabledFilter() {
        return function (input) {
            return input ? 'Enabled' : 'Disabled';
        };
    }

    //--
    app.controller('sidebar', ['$routeParams', 'projectStorage', 'idGenerator', '$location', '$window', sidebarController]);
    function sidebarController($routeParams, projectStorage, idGenerator, $location) {
        var self = this;

        self.projects = [];

        projectStorage.init().then(function () {
            self.projects = projectStorage.projects;
        });

        self.isActive = function (projectId) {
            return projectId == $routeParams.projectId;
        };

        self.stageProject = function (projectId) {
            self.stagedProject = projectStorage.getOne(projectId);
        };

        self.createProject = function () {

            var project = {
                id: idGenerator(),
                name: 'New project',
                environments: [],
                links: []
            };

            self.projects.unshift(project);
            projectStorage.save();

            $location.path('/project/' + project.id);
        };

        self.deleteProject = function (projectId) {

            // Find environment index and remove it from project.
            for (var i = 0; i < self.projects.length; i++) {
                if (self.projects[i].id == projectId) {
                    self.projects.splice(i, 1);
                    break;
                }
            }
            projectStorage.save();
            $location.path('/');
        };

        self.exportProjects = function() {
            var a = document.createElement('a');
            var file = new Blob([JSON.stringify(self.projects, null, 4)], {type: 'application/json'});
            a.href = URL.createObjectURL(file);
            a.download = 'es-projects.json';
            a.click();
        };

        self.importProjects = function() {

            // We have to keep this element in the DOM for the purpose of testing.
            var fileUpload = document.getElementById('upload-projects');
            fileUpload.type = "file";
            fileUpload.click();
            fileUpload.addEventListener("change", function (evt) {

                var file = evt.target.files[0];

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {

                    return function(e) {
                        projectStorage.projects = JSON.parse(e.target.result);
                        projectStorage.save();
                        projectStorage.init().then(function (projectsData) {
                            self.projects = projectStorage.getAll();
                        });

                    };
                })(file);

                reader.readAsText(file);

            });

        };

        self.openSourceCode = function() {
            window.location = "https://github.com/Chi-teck/environment-switcher";
        };

    }

    //--
    app.controller('projectForm', ['$routeParams', 'projectStorage', '$scope', 'projectStorageInit', projectFormController]);
    function projectFormController($routeParams, projectStorage, $scope) {

        var self = this;
        self.project = projectStorage.getOne($routeParams.projectId);

        self.change = function () {
            projectStorage.save(self.project);
        };

        self.openEnvironmentForm = function (environmentId) {
            $scope.$broadcast('environment-form', environmentId);
        };

        self.openLinkForm = function (environmentId) {
            $scope.$broadcast('link-form', environmentId);
        };

    }

    //--
    app.factory('projectStorage', ['$filter', '$q', projectStorageFactory]);
    function projectStorageFactory($filter, $q) {

        return new function () {
            this.projects = [];

            this.init = function () {
                var self = this;
                var deferred = $q.defer();
                if (this.projects.length > 0) {
                    deferred.resolve();
                }
                else {
                    chrome.storage.local.get('projects', function (data) {
                        self.projects = data.projects || [];
                        deferred.resolve();
                    });
                }
                return deferred.promise;
            };

            this.getAll = function () {
                return this.projects;
            };

            this.getOne = function (projectId) {
                return $filter('filter')(this.projects, {id: projectId})[0];
            };

            this.save = function () {
                //var project = this.getOne(newProject.id);
                chrome.storage.local.set({projects: this.projects});
            };

        };

    }

    //--
    app.factory('idGenerator', [generateIdFactory]);
    function generateIdFactory() {
        return function () {
            return 'xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
    }

    //--
    app.factory('removeById', [removeByIdFactory]);
    function removeByIdFactory() {
        return function (source, id) {
            for (var i = 0; i < source.length; i++) {
                if (source[i].id == id) {
                    source.splice(i, 1);
                    break;
                }
            }
        };
    }

    //--
    app.controller('environmentForm', ['$routeParams', 'projectStorage', '$filter', 'idGenerator', '$scope', '$route', environmentFormController]);
    function environmentFormController($routeParams, projectStorage, $filter, idGenerator, $scope, $route) {

        var project = projectStorage.getOne($routeParams.projectId);

        var self = this;
        var storedEnvironment = {};

        $scope.$on('environment-form', function (event, environmentId) {

            if (environmentId) {
                storedEnvironment = $filter('filter')(project.environments, {id: environmentId})[0];
                self.environment = angular.copy(storedEnvironment);
            }
            else {
                self.isNew = true;
                self.environment = {
                    id: idGenerator(),
                    status: true
                };
            }

            self.title = self.isNew ? 'Create environment' : 'Edit environment';

        });

        self.submit = function () {

            angular.copy(self.environment, storedEnvironment);

            if (self.isNew) {
                //project.environments = project.environments ? project.environments : [];
                project.environments.push(storedEnvironment);

            }
            projectStorage.save();

            $route.reload();
        };

        self.cancel = function () {
            angular.copy(storedEnvironment, self.environment);
        };

        self.removeEnvironment = function () {
            // Find environment index and remove it from project.
            for (var i = 0; i < project.environments.length; i++) {
                if (project.environments[i].id == self.environment.id) {
                    project.environments.splice(i, 1);
                    break;
                }
            }
            projectStorage.save();
        };

    }

    //--
    app.controller('linkForm', ['$routeParams', 'projectStorage', '$filter', 'idGenerator', '$scope', '$route', 'removeById', linkFormController]);
    function linkFormController($routeParams, projectStorage, $filter, idGenerator, $scope, $route, removeById) {

        var project = projectStorage.getOne($routeParams.projectId);

        var self = this;
        var storedLink = {};

        $scope.$on('link-form', function (event, linkId) {
            if (linkId) {
                storedLink = $filter('filter')(project.links, {id: linkId})[0];
                self.link = angular.copy(storedLink);
            }
            else {
                self.isNew = true;
                self.link = {
                    id: idGenerator(),
                    status: true
                };
            }
            self.title = self.isNew ? 'Create link' : 'Edit link';
        });

        self.saveLink = function () {

            angular.copy(self.link, storedLink);

            if (self.isNew) {
                  //project.environments = project.environments ? project.environments : [];
                project.links.push(storedLink);

            }
            projectStorage.save(project);

            $route.reload();
        };

        self.cancel = function () {
            angular.copy(storedLink, self.link);
        };


        self.removeLink = function () {

            removeById(project.links, self.link.id);

            // Find environment index and remove it from project.

            projectStorage.save();
        };


    }

}());

