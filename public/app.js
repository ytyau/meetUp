var app = angular.module('csci2720-proj', ['ngRoute', 'ngCookies', 'smart-table']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/login.html',
            controller: 'LoginController'
        })

        .when('/signup', {
            templateUrl: 'pages/signup.html',
            controller: 'SignUpController'
        })

        .when('/admin', {
            templateUrl: 'pages/admin.html',
            controller: 'AdminController'
        })

        .when('/admin-event', {
            templateUrl: 'pages/admin-event.html',
            controller: 'AdminEventController'
        })

        .when('/admin-account', {
            templateUrl: 'pages/admin-account.html',
            controller: 'AdminAccountController'
        })

        .when('/user', {
            templateUrl: 'pages/user.html',
            controller: 'UserController'
        })

        .when('/user-event', {
            templateUrl: 'pages/user-event.html',
            controller: 'UserEventController'
        })

        .when('/user-fav-event', {
            templateUrl: 'pages/user-fav-event.html',
            controller: 'UserFavEventController'
        })

        .when('/event', {
            templateUrl: 'pages/event.html',
            controller: 'EventController'
        })

        .when('/about', {
            templateUrl: 'pages/about.html',
            controller: 'AboutController'
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