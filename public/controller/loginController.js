app.controller('LoginController', function ($scope, $location, $http, $cookies) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";

    var token = $location.search().token;
    if (token) {
        var url = "http://localhost:3000/MailVerification?token=" + token;
        $scope.veriResult = "";
        $http.get(url).then(function (res) {
            $scope.veriResult = 'alert-success';
            $scope.veriDisplay = "Success"
        }).catch(function (err) {
            $scope.veriResult = 'alert-danger';
            $scope.veriDisplay = "Failed"
        })
    } else {
        /*********** Check if Logged in Start ***********/
        if ($cookies.get(cookies_memberInfo)) {
            $location.path("/");
        }
        /*********** Check if Logged in End ***********/
    }

    $scope.loginForm = document.getElementById("loginForm");
    $scope.email;
    $scope.pwd;

    $scope.loginForm.onsubmit = function () {
        //console.log("form submitted", $scope.loginForm.acc.value, $scope.loginForm.pwd.value);

        if ($scope.email && $scope.pwd) {
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
                        $scope.$apply(function () {
                            $location.path("/home");
                        });
                    },
                    202: function (response) {
                        alert(response.data);
                    }
                },
                error: function (err) {
                    alert(err.data);
                }
            });
            return false;
        } else {
            window.alert("Please enter all fields");
        }
    }
});