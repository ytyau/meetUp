var app = angular.module('csci2720-proj', ['ngRoute', 'ngCookies', 'smart-table']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'HomeController'
        })

        .when('/home', {
            templateUrl: 'pages/home.html',
            controller: 'HomeController'
        })

        .when('/login', {
            templateUrl: 'pages/login.html',
            controller: 'LoginController'
        })

        .when('/signup', {
            templateUrl: 'pages/signup.html',
            controller: 'SignUpController'
        })

        .when('/createGroup', {
            templateUrl: 'pages/createGroup.html',
            controller: 'CreateGroupController'
        })

        .otherwise({
            redirectTo: '/'
        });
});

app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});