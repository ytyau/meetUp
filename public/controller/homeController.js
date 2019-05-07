app.controller('HomeController', function ($scope, $location, $window, $cookieStore, $cookies, $filter) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";

    /*********** Check if Logged in Start ***********/
    if (!$cookies.get(cookies_memberInfo)) {
        $location.path("/login");
        console.log("Please sign in")
    } else {
        console.log("logged in");
    }
    /*********** Check if Logged in End ***********/

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
});