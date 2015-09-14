describe('Sidebar test suite', function() {

    var ctrl;
    var $scope;
    var $q;
    var deferred;

    beforeEach(function() {
        //console.info('------------------');
    });

    beforeEach(module('app'));

    beforeEach(inject(function($controller, _$rootScope_, _$q_) {
        $scope = _$rootScope_.$new();
        deferred = _$q_.defer();

        var projectStorage = {
            init: function() {
                return deferred.promise;
            },
            save: function() {},
            projects: mockProjects
        };

        ctrl = $controller('sidebar', {
            $scope: $scope,
            projectStorage: projectStorage
        });
    }));

    it('xxxxxxxxxxxxx', function () {
        deferred.resolve();
        $scope.$apply();

        expect(ctrl.projects).toEqual(mockProjects);
        ctrl.createProject();
        expect(ctrl.projects).toEqual(mockProjects);
    });

});

