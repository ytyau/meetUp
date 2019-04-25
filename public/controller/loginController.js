app.controller('LoginController', function ($scope, $location, $cookieStore, $cookies) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";
    /*********** Check if Logged in Start ***********/


    if ($cookies.get(cookies_memberInfo)) {
        if ($cookies.get(cookies_memberInfo)) {
            //$location.path("admin");
            console.log("Signed In")
            //$scope.$apply();
        } else {
            //$location.path("user");
        }
    }
    /*********** Check if Logged in End ***********/


    $scope.loginForm = document.getElementById("loginForm");
    $scope.username;
    $scope.pwd;
    $scope.loginForm.onsubmit = function (role) {
        //console.log("form submitted", $scope.loginForm.acc.value, $scope.loginForm.pwd.value);

        if ($scope.username && $scope.pwd) {
            var dest = baseUrl + '/SignIn';
            $.ajax(dest, {
                type: "POST",
                data: $("#loginForm").serialize(),
                statusCode: {
                    200: function (response) {
                        console.log(response);
                        var now = Date.now();
                        var expiryDate = new Date();
                        expiryDate.setTime(now + cookiesAlivePeriod);
                        $cookies.put(cookies_memberId, response.MemberID, {
                            'expires': expiryDate
                        });
                        $cookies.put(cookies_memberInfo, JSON.stringify(response), {
                            'expires': expiryDate
                        });
                        //$location.path("user");
                        //$scope.$apply();
                    },
                    202: function (response) {
                        alert(response);
                    }
                },
                error: function (err) {
                    alert(err);
                }
            });
            return false;
        } else {
            window.alert("Please enter all fields!");
        }
    }
});