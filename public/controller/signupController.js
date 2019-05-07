app.controller('SignUpController', function ($scope, $filter) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';

    $scope.signUpForm = document.getElementById("signUpForm");
    $scope.userInfo = {
        email: "",
        username: "",
        pwd: "",
        gender: "",
        dob: "",
        isStudent: 0
    }

    $scope.submitForm = function (role) {
        console.log(role)
        var postData = angular.copy($scope.userInfo);
        postData.dob = $filter('date')(postData.dob, 'yyyy-MM-dd');
        if (role == "student") {
            postData.isStudent = 1;
        } else {
            postData.isStudent = 0;
        }
        console.dir(postData);
        if (postData.email != "" && postData.username != "" && postData.pwd != "" && postData.gender != "" && postData.dob != "") {
            var dest = baseUrl + '/SignUp';
            $.ajax(dest, {
                type: "POST",
                data: postData,
                statusCode: {
                    200: function (response) {
                        console.log(response);
                        alert("Sign up successful")
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