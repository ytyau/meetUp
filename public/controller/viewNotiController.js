app.controller('ViewNotiController', function ($scope, $filter, $cookies, getNoti, $location, $http) {
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
        //clearInterval(interval)
    } else {
        console.log("logged in");
        memberId = $cookies.get(cookies_memberId)
        memberInfo = JSON.parse($cookies.get(cookies_memberInfo));
        $scope.role = memberInfo.Username
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

    $scope.newNotification;
    if (memberId) {
        getNoti.pullNoti(memberId).then(function (res) {
            $scope.allNotification = angular.copy(res.data);
            $scope.newNotification = $scope.allNotification.filter(a => a.IsRead == false)
            $scope.allNotification = $scope.allNotification.map((a) => {
                if (a.CourseRecommendation) {
                    a.CourseRecommendation = JSON.parse(a.CourseRecommendation);
                }
                return a
            })
            console.dir($scope.allNotification);
        }).catch(function (err) {
            console.log(err)
        })
    } else {
        memberId = $cookies.get(cookies_memberId)
    }

    let interval;
    if (memberId) {
        interval = setInterval(function () {
            getNoti.pullNoti(memberId).then(function (res) {
                $scope.allNotification = angular.copy(res.data);
                $scope.newNotification = $scope.allNotification.filter(a => a.IsRead == false)
                $scope.allNotification = $scope.allNotification.map((a) => {
                    if (a.CourseRecommendation) {
                        a.CourseRecommendation = JSON.parse(a.CourseRecommendation);
                    }
                    return a
                })
                //console.dir($scope.newNotification);
            }).catch(function (err) {
                console.log(err)
            })
        }, 3000);
    } else {
        clearInterval(interval);
    }


    $scope.markAsRead = function (NotificationID) {
        let url = baseUrl + '/ReadNotification';
        $http.get(url, {
            params: {
                notificationId: NotificationID
            }
        }).then(function (res) {
            //alert(res.data)
            location.reload();
        }).catch(function (err) {
            console.log(err);
        })
    }

    $scope.viewEvent = function (eventID, oldeventID, oldjoinID) {
        clearInterval(interval)
        $location.path('viewEvent').search({
            id: eventID,
            quit: oldeventID,
            oldJoin: oldjoinID
        });
    }

    $scope.$on("$destroy", function () {
        clearInterval(interval);
    });
});