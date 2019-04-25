app.controller('LoginController', function ($scope, $location, $cookieStore, $cookies) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins

    /*********** Check if Logged in Start ***********/
    /*const cookies_username = "username";
    const cookies_favouriteEvent = "favouriteEvent"
    const cookies_userid = "userId";

    if ($cookies.get(cookies_username)) {
        if ($cookies.get(cookies_username) == "IamAdminHaHaHa") {
            $location.path("admin");
            $scope.$apply();
        } else {
            $location.path("user");
        }
    }*/
    /*********** Check if Logged in End ***********/


    $scope.loginForm = document.getElementById("loginForm");
    $scope.username;
    $scope.pwd;
    $scope.loginForm.onsubmit = function (role) {
        //console.log("form submitted", $scope.loginForm.acc.value, $scope.loginForm.pwd.value);
        var isStudent;
        if (role == 'student') {
            isStudent = 1;
        } else {
            isStudent = 0;
        }

        if ($scope.acc && $scope.password) {
            /*var dest = baseUrl + '/user/login';
                $.ajax(dest, {
                    type: "POST",
                    data: $("#loginForm").serialize(),
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
                });*/
        } else {
            window.alert("Please enter all fields!");
        }
    }
});