app.controller('SignUpController', function ($scope, $location, $cookieStore, $cookies) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins

    $scope.loginForm = document.getElementById("loginForm");
    $scope.userInfo = {
        username: "",
        pwd: "",
        gender: "",
        dob: "",
        isStudent: 0
    }
    $scope.submitForm = function (role) {
        //console.log("form submitted", $scope.loginForm.acc.value, $scope.loginForm.pwd.value);
        e.preventDefault();
        console.dir($scope.userInfo);
        if (role == 'student') {
            $scope.userInfo.isStudent = 1;
        } else {
            $scope.userInfo.isStudent = 0;
        }
        if ($scope.userInfo.username != "" && $scope.userInfo.pwd != "" && $scope.userInfo.gender != "" && $scope.userInfo.dob != "") {
            var dest = baseUrl + '/SignUp';
            $.ajax(dest, {
                type: "POST",
                data: $scope.userInfo,
                statusCode: {
                    200: function (response) {
                        //console.log(response.acc);
                        var now = Date.now();
                        var expiryDate = new Date();
                        expiryDate.setTime(now + cookiesAlivePeriod);
                        $cookies.put(cookies_username, response.acc, {
                            'expires': expiryDate
                        });
                        $cookies.put(cookies_favouriteEvent, JSON.stringify(response.favouriteEvent), {
                            'expires': expiryDate
                        });
                        $cookies.put(cookies_userid, response._id, {
                            'expires': expiryDate
                        });
                        $location.path("user");
                        $scope.$apply();
                    },
                    202: function (response) {
                        alert(response);
                    }
                },
                error: function (err) {
                    alert(err);
                }
            });
        } else {
            window.alert("Please enter all fields!");
        }
        return false;
    }
});