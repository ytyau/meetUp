app.factory('getNoti', function ($http) {
    return {
        pullNoti: function (memberId) {
            var url = 'http://localhost:3000/GetNotification';
            return $http.get(url, {
                params: {
                    memberId: memberId
                }
            });
        }
    };
});