//TODO: pager
app.controller('HomeController', function ($scope, $http, $location, $window, $cookieStore, $cookies, $filter) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";
    var memberId;
    var memberInfo;

    /*********** Check if Logged in Start ***********/
    if (!$cookies.get(cookies_memberInfo)) {
        $location.path("/login");
        console.log("Please sign in")
    } else {
        console.log("logged in");
        memberId = $cookies.get(cookies_memberId)
        memberInfo = JSON.parse($cookies.get(cookies_memberInfo));
        $scope.role = memberInfo.Username
    }
    /*********** Check if Logged in End ***********/

    $scope.displayEvents;
    $scope.event;
    $scope.predicates = ['Title', 'Course', 'Level', 'Location', 'RepeatBy'];

    var top = 10;
    var offset = 0;
    var url = baseUrl + '/GetEvent?top=' + top + '&offset=' + offset + '&isGetAll=true';
    $http.get(url).then(function (response) {
        $scope.displayEvents = angular.copy(response.data.recordsets[0]);
        $scope.event = angular.copy(response.data.recordsets[0]);
        //$scope.$apply();
        console.dir($scope.displayEvents);
    })

    $scope.logout = function () {
        //console.log("signout now");
        if ($cookies.get(cookies_memberInfo)) {
            $cookies.remove(cookies_memberInfo);
        }
        if ($cookies.get(cookies_memberId)) {
            $cookies.remove(cookies_memberId);
        }
        $location.path("/login");
    }

    $scope.viewEvent = function (event) {
        $location.path('viewEvent').search({
            id: event.EventID
        });
    }
});