app.controller('SignUpController', function ($scope, $location, $cookieStore, $cookies, $filter) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins

    $scope.signUpForm = document.getElementById("signUpForm");
    $scope.userInfo = {
        username: "",
        pwd: "",
        gender: "",
        dob: "",
        isStudent: 0
    }
    $scope.signUpForm.onsubmit = function (role) {
        //console.log("form submitted", $scope.loginForm.acc.value, $scope.loginForm.pwd.value);

        var postData = angular.copy($scope.userInfo);
        postData.dob = $filter('date')(postData.dob, 'yyyy-MM-dd')
        if (role == 'student') {
            postData.isStudent = 1;
        } else {
            postData.isStudent = 0;
        }
        //console.dir(postData);
        if (postData.username != "" && postData.pwd != "" && postData.gender != "" && postData.dob != "") {
            var dest = baseUrl + '/SignUp';
            $.ajax(dest, {
                type: "POST",
                data: postData,
                statusCode: {
                    200: function (response) {
                        console.log(response);
                        /*var now = Date.now();
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
                        $scope.$apply();*/
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