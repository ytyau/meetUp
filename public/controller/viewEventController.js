app.controller('ViewEventController', function ($scope, $http, $location, $window, $cookieStore, $cookies, $filter, getNoti) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";
    var memberId;
    var memberInfo;

    /*********** Check if Logged in Start ***********/
    if (!$cookies.get(cookies_memberInfo)) {
        $location.url("/login");
        console.log("Please sign in")
        //clearInterval(interval)
    } else {
        console.log("logged in");
        memberId = $cookies.get(cookies_memberId)
        memberInfo = JSON.parse($cookies.get(cookies_memberInfo));
        $scope.role = memberInfo.Username;
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

    var eventID = $location.search().id;
    var quitEventID = $location.search().quit;
    var oldJoinID = $location.search().oldJoin;
    //console.log(eventID);

    $scope.newNotification;
    let interval;
    if (memberId) {
        interval = setInterval(function () {
            getNoti.pullNoti(memberId).then(function (res) {
                var notification = angular.copy(res.data);
                $scope.newNotification = notification.filter(a => a.IsRead == false)
                //console.log($scope.newNotification);
            }).catch(function (err) {
                console.log(err)
            })
        }, 3000);
    } else {
        clearInterval(interval);
    }

    $scope.inGroup = [];
    var url;
    var url2 = baseUrl + '/GetEventMember?eventId=' + eventID;
    $http.get(url2).then(function (response) {
        $scope.memberInfo = angular.copy(response.data);
        $scope.memberInfo.forEach(element => {
            if (element.Age < 3) {
                element.displayAge = "Aged under 3";
            } else if (element.Age > 3 && element.Age < 11) {
                element.displayAge = "Aged 4 - 10";
            } else if (element.Age > 10 && element.Age < 16) {
                element.displayAge = "Aged 11 - 15";
            } else if (element.Age > 15 && element.Age < 21) {
                element.displayAge = "Aged 16 - 20";
            } else if (element.Age > 20 && element.Age < 31) {
                element.displayAge = "Aged 21 - 30";
            } else if (element.Age > 30 && element.Age < 41) {
                element.displayAge = "Aged 31 - 40";
            } else if (element.Age > 40 && element.Age < 51) {
                element.displayAge = "Aged 41 - 50";
            } else if (element.Age > 50 && element.Age < 61) {
                element.displayAge = "Aged 51 - 60";
            } else {
                element.displayAge = "Aged 61 or above";
            }
        });
        console.dir($scope.memberInfo);
        $scope.inGroup = $scope.memberInfo.filter(a =>
            a.MemberID == memberId
        )
        console.dir($scope.inGroup);
        if ($scope.inGroup.length > 0) {
            url = baseUrl + '/GetEvent?top=1&offset=0&eventId=' + eventID + '&memberId=' + memberId;
            $http.get(url).then(function (response) {
                $scope.eventInfo = angular.copy(response.data.recordsets[0][0]);
                //console.dir($scope.eventInfo);
                if ($scope.eventInfo.AvailableTime) {
                    $scope.eventInfo.AvailableTime = JSON.parse($scope.eventInfo.AvailableTime);
                }
                console.dir($scope.eventInfo);
            })
        } else {
            url = baseUrl + '/GetEvent?top=1&offset=0&eventId=' + eventID;
            $http.get(url).then(function (response) {
                $scope.eventInfo = angular.copy(response.data.recordsets[0][0]);
                //console.dir($scope.eventInfo);
                if ($scope.eventInfo.AvailableTime) {
                    $scope.eventInfo.AvailableTime = JSON.parse($scope.eventInfo.AvailableTime);
                }
                console.dir($scope.eventInfo);
            })
        }
    })

    var url3 = baseUrl + '/GetDiscussion';
    $scope.commentThread;
    $http.get(url3, {
        params: {
            eventId: eventID
        }
    }).then(function (response) {
        $scope.commentThread = angular.copy(response.data);
    }).catch(function (err) {
        console.log(err);
    })

    $scope.haveAvailability = false;
    $scope.error = {
        availabilityMon: false,
        availabilityTues: false,
        availabilityWed: false,
        availabilityThurs: false,
        availabilityFri: false,
        availabilitySat: false,
        availabilitySun: false
    }
    $scope.availabilityChange = function () {
        //setTimeout(function () {
        var availabilityForm = document.getElementById("createGroupForm2");
        var matches;
        /*if (availabilityForm.availabilityMon.value) {
            matches = availabilityForm.availabilityMon.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilityMon.$invalid = true;
                    $scope.error.availabilityMon = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilityMon.$invalid = false;
                    $scope.error.availabilityMon = false;
                    //console.log("correct")
                }
            }
        }

        if (availabilityForm.availabilityTues.value) {
            //console.log(availabilityForm.availabilityTue.value);
            matches = availabilityForm.availabilityTues.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilityTues.$invalid = true;
                    $scope.error.availabilityTues = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilityTues.$invalid = false;
                    $scope.error.availabilityTues = false;
                    //console.log("correct")
                }
            }
        }

        if (availabilityForm.availabilityWed.value) {
            //console.log(availabilityForm.availabilityWed.value);
            matches = availabilityForm.availabilityWed.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilityWed.$invalid = true;
                    $scope.error.availabilityWed = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilityWed.$invalid = false;
                    $scope.error.availabilityWed = false;
                    //console.log("correct")
                }
            }
        }

        if (availabilityForm.availabilityThurs.value) {
            //console.log(availabilityForm.availabilityThurs.value);
            matches = availabilityForm.availabilityThurs.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilityThurs.$invalid = true;
                    $scope.error.availabilityThurs = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilityThurs.$invalid = false;
                    $scope.error.availabilityThurs = false;
                    //console.log("correct")
                }
            }
        }

        if (availabilityForm.availabilityFri.value) {
            //console.log(availabilityForm.availabilityFri.value);
            matches = availabilityForm.availabilityFri.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilityFri.$invalid = true;
                    $scope.error.availabilityFri = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilityFri.$invalid = false;
                    $scope.error.availabilityFri = false;
                    //console.log("correct")
                }
            }
        }

        if (availabilityForm.availabilitySat.value) {
            //console.log(availabilityForm.availabilitySat.value);
            matches = availabilityForm.availabilitySat.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilitySat.$invalid = true;
                    $scope.error.availabilitySat = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilitySat.$invalid = false;
                    $scope.error.availabilitySat = false;
                    //console.log("correct")
                }
            }
        }

        if (availabilityForm.availabilitySun.value) {
            //console.log(availabilityForm.availabilitySun.value);
            matches = availabilityForm.availabilitySun.value.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
            if (matches.length === 5) {
                range = {
                    from: {
                        hour: matches[1],
                        minute: matches[2]
                    },
                    to: {
                        hour: matches[3],
                        minute: matches[4]
                    }
                }
                if (validateTimeRange(range)) {
                    $scope.createGroupForm2.availabilitySun.$invalid = true;
                    $scope.error.availabilitySun = true;
                    //console.log("error");
                } else {
                    $scope.createGroupForm2.availabilitySun.$invalid = false;
                    $scope.error.availabilitySun = false;
                    //console.log("correct")
                }
            }
        }*/

        $scope.availability = {
            mon: availabilityForm.availabilityMon ? availabilityForm.availabilityMon.value : null,
            tues: availabilityForm.availabilityTues ? availabilityForm.availabilityTues.value : null,
            wed: availabilityForm.availabilityWed ? availabilityForm.availabilityWed.value : null,
            thurs: availabilityForm.availabilityThurs ? availabilityForm.availabilityThurs.value : null,
            fri: availabilityForm.availabilityFri ? availabilityForm.availabilityFri.value : null,
            sat: availabilityForm.availabilitySat ? availabilityForm.availabilitySat.value : null,
            sun: availabilityForm.availabilitySun ? availabilityForm.availabilitySun.value : null
        }
        var hasError = $scope.error.availabilityMon || $scope.error.availabilityTues || $scope.error.availabilityWed || $scope.error.availabilityThurs || $scope.error.availabilityFri || $scope.error.availabilitySat || $scope.error.availabilitySun;
        console.dir($scope.error);
        if (hasError) {
            $scope.haveAvailability = false;
        } else {
            if ($scope.availability.mon || $scope.availability.tues || $scope.availability.wed || $scope.availability.thurs || $scope.availability.fri || $scope.availability.sat || $scope.availability.sun) {
                $scope.haveAvailability = true;
            } else {
                $scope.haveAvailability = false;
            }
        }
        console.log($scope.haveAvailability);
    }

    function validateTimeRange(range) {
        if (range.from.hour > range.to.hour) {
            return true;
        } else if (range.from.hour == range.to.hour) {
            if (range.from.minute >= range.to.minute) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /*********** Timepicker control ***********/
    $('.timerange').on('click', function (e) {
        if ($('.timerangepicker-container').is(":visible")) {
            console.log("opened");
            var timerangeContainer = $('.timerangepicker-container');
            if (timerangeContainer.length > 0) {
                var timeRange = {
                    from: {
                        hour: timerangeContainer.find('.value')[0].innerText,
                        minute: timerangeContainer.find('.value')[1].innerText
                    },
                    to: {
                        hour: timerangeContainer.find('.value')[2].innerText,
                        minute: timerangeContainer.find('.value')[3].innerText
                    },
                };

                timerangeContainer.parent().find('input').val(
                    timeRange.from.hour + ":" +
                    timeRange.from.minute +
                    " - " +
                    timeRange.to.hour + ":" +
                    timeRange.to.minute
                );
                timerangeContainer.remove();
            }
        } else {
            e.stopPropagation();
            var input = $(this).find('input');

            var now = new Date();
            var hours = now.getHours();
            var minutes = now.getMinutes();

            var range = {
                from: {
                    hour: hours,
                    minute: minutes
                },
                to: {
                    hour: hours,
                    minute: minutes
                }
            };

            if (input.val() !== "") {
                var timerange = input.val();
                var matches = timerange.match(/([0-9]{2}):([0-9]{2}) - ([0-9]{2}):([0-9]{2})/);
                if (matches.length === 5) {
                    range = {
                        from: {
                            hour: matches[1],
                            minute: matches[2]
                        },
                        to: {
                            hour: matches[3],
                            minute: matches[4]
                        }
                    }
                }
            };
            console.log(range);

            var html = '<div class="timerangepicker-container">' +
                '<div class="timerangepicker-from">' +
                '<label class="timerangepicker-label">From:</label>' +
                '<div class="timerangepicker-display hour">' +
                '<span class="increment fa fa-angle-up"></span>' +
                '<span class="value">' + ('0' + range.from.hour).substr(-2) + '</span>' +
                '<span class="decrement fa fa-angle-down"></span>' +
                '</div>' +
                ':' +
                '<div class="timerangepicker-display minute">' +
                '<span class="increment fa fa-angle-up"></span>' +
                '<span class="value">' + ('0' + range.from.minute).substr(-2) + '</span>' +
                '<span class="decrement fa fa-angle-down"></span>' +
                '</div>' +
                '</div>' +
                '<div class="timerangepicker-to">' +
                '<label class="timerangepicker-label">To:</label>' +
                '<div class="timerangepicker-display hour">' +
                '<span class="increment fa fa-angle-up"></span>' +
                '<span class="value">' + ('0' + range.to.hour).substr(-2) + '</span>' +
                '<span class="decrement fa fa-angle-down"></span>' +
                '</div>' +
                ':' +
                '<div class="timerangepicker-display minute">' +
                '<span class="increment fa fa-angle-up"></span>' +
                '<span class="value">' + ('0' + range.to.minute).substr(-2) + '</span>' +
                '<span class="decrement fa fa-angle-down"></span>' +
                '</div>' +
                '</div>' +
                '</div>';

            $(html).insertAfter(this);
            $('.timerangepicker-container').on(
                'click',
                '.timerangepicker-display.hour .increment',
                function () {
                    var value = $(this).siblings('.value');
                    value.text(
                        increment(value.text(), 23, 0, 2)
                    );
                }
            );

            $('.timerangepicker-container').on(
                'click',
                '.timerangepicker-display.hour .decrement',
                function () {
                    var value = $(this).siblings('.value');
                    value.text(
                        decrement(value.text(), 23, 0, 2)
                    );
                }
            );

            $('.timerangepicker-container').on(
                'click',
                '.timerangepicker-display.minute .increment',
                function () {
                    var value = $(this).siblings('.value');
                    value.text(
                        increment(value.text(), 59, 0, 2)
                    );
                }
            );

            $('.timerangepicker-container').on(
                'click',
                '.timerangepicker-display.minute .decrement',
                function () {
                    var value = $(this).siblings('.value');
                    value.text(
                        decrement(value.text(), 59, 0, 2)
                    );
                }
            );
        }
    });

    $(document).on('click', e => {

        if (!$(e.target).closest('.timerangepicker-container').length) {
            if ($('.timerangepicker-container').is(":visible")) {
                var timerangeContainer = $('.timerangepicker-container');
                if (timerangeContainer.length > 0) {
                    var timeRange = {
                        from: {
                            hour: timerangeContainer.find('.value')[0].innerText,
                            minute: timerangeContainer.find('.value')[1].innerText
                        },
                        to: {
                            hour: timerangeContainer.find('.value')[2].innerText,
                            minute: timerangeContainer.find('.value')[3].innerText
                        },
                    };

                    timerangeContainer.parent().find('input').val(
                        timeRange.from.hour + ":" +
                        timeRange.from.minute +
                        " - " +
                        timeRange.to.hour + ":" +
                        timeRange.to.minute
                    );

                    timerangeContainer.remove();
                }
            }
        }
    });

    function increment(value, max, min, size) {
        var intValue = parseInt(value);
        if (intValue == max) {
            return ('0' + min).substr(-size);
        } else {
            var next = intValue + 1;
            return ('0' + next).substr(-size);
        }
    }

    function decrement(value, max, min, size) {
        var intValue = parseInt(value);
        if (intValue == min) {
            return ('0' + max).substr(-size);
        } else {
            var next = intValue - 1;
            return ('0' + next).substr(-size);
        }
    }
    /*********** Timepicker control ***********/

    var createGroupForm = document.getElementById("createGroupForm2");
    $scope.submitForm = function () {
        var data = {
            memberId: memberId,
            eventId: eventID,
            availableTime: JSON.stringify($scope.availability),
            isToSendNoti: true
        }
        console.dir(data);
        var dest = baseUrl + '/JoinEvent';
        $http.get(dest, {
            params: data
        }).then(function (response) {
            console.log(response.data);
            if (quitEventID && oldJoinID) {
                $scope.quitGroup(quitEventID, oldJoinID);
            }
            location.reload();
            alert(response.data)
        }).catch(function (err) {
            alert(err.data);
        });
        return false;
    }


    $scope.quitGroup = function (id, oldJoinID) {
        var dest = baseUrl + '/QuitEvent';
        var postData = {
            eventId: id ? id : eventID,
            joinId: oldJoinID ? oldJoinID : $scope.eventInfo.JoinID
        }

        $.ajax(dest, {
            type: "POST",
            data: postData,
            statusCode: {
                200: function (response) {
                    alert(response);
                    location.reload();
                }
            },
            error: function (err) {
                alert(err.data);
            }
        });
    }

    $scope.input = {
        newComments: ''
    };
    $scope.submitComment = function () {
        console.log($scope.input.newComments);
        var dest2 = baseUrl + '/PostDiscussion';
        var postData = {
            memberId: memberId,
            eventId: eventID,
            discussContent: $scope.input.newComments
        }
        $.ajax(dest2, {
            type: "POST",
            data: postData,
            statusCode: {
                200: function (response) {
                    alert(response);
                    location.reload();
                }
            },
            error: function (err) {
                alert(err.data);
            }
        });
    }

    $scope.$on("$destroy", function () {
        clearInterval(interval);
    });
})