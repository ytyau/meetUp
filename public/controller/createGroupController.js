app.controller('CreateGroupController', function ($scope, $location, $cookieStore, $cookies, $filter, districtList, categoryList, langClassList, instrumentClassList, academicClassList, getNoti) {
    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";

    /*********** Check if Logged in Start ***********/
    if (!$cookies.get(cookies_memberInfo)) {
        $location.path("/login");
        //clearInterval(interval)
    } else {
        $scope.memberId = $cookies.get(cookies_memberId);
        $scope.memberInfo = JSON.parse($cookies.get(cookies_memberInfo));
        $scope.role = $scope.memberInfo.Username
    }
    /*********** Check if Logged in End ***********/

    $scope.newNotification;
    let interval;
    if ($scope.memberId) {
        interval = setInterval(function () {
            getNoti.pullNoti($scope.memberId).then(function (res) {
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


    $scope.categorySelected = '';
    $scope.displayCourseList = [];
    $scope.displayLevelList = [];
    $scope.districtList = districtList;
    $scope.categoryList = categoryList;
    $scope.repeatPeriod = ["Day", "Week", "2 weeks", "Month"]
    $scope.haveAvailability = false;

    $scope.userInput = {
        repeatBy: "",
        durationHr: null, //TODO: validate duration
        durationMin: null,
        location: "",
        minParticipant: "",
        maxParticipant: "",
        courseObj: null,
        customCourse: "",
        level: "",
        title: "",
        content: "",
        availability: {
            mon: "",
            tues: "",
            wed: "",
            thurs: "",
            fri: "",
            sat: "",
            sun: ""
        }
    }


    $scope.error = {
        availabilityMon: false,
        availabilityTues: false,
        availabilityWed: false,
        availabilityThurs: false,
        availabilityFri: false,
        availabilitySat: false,
        availabilitySun: false
    }

    $scope.changeList = function () {
        //console.log($scope.categorySelected)
        $scope.userInput.courseObj = null;
        switch ($scope.categorySelected) {
            case 'Academic':
                $scope.displayCourseList = academicClassList;
                break;

            case 'Language':
                $scope.displayCourseList = langClassList;
                break;

            case 'Instruments':
                $scope.displayCourseList = instrumentClassList;
                break;

            case 'Others':
                $scope.displayCourseList = [];
                var courseObj = {
                    "name": $scope.userInput.customCourse,
                    "level": [
                        "Beginner", "Intermediate", "Advanced"
                    ]
                }
                $scope.userInput.courseObj = JSON.stringify(courseObj);
                $scope.changeLevelList();
                break;

            default:
                $scope.displayCourseList = []
                break;
        }
    }

    $scope.changeLevelList = function () {
        let obj = JSON.parse($scope.userInput.courseObj);
        $scope.displayLevelList = obj["level"];
        $scope.userInput.level = "";
        //console.dir($scope.displayLevelList);
    }

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

    $scope.availabilityChange = function () {
        //setTimeout(function () {
        var availabilityForm = document.getElementById("createGroupForm2");
        var matches;

        /*if (availabilityForm.availabilityMon.value) {
                    //console.log(availabilityForm.availabilityMon.value);
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
        } else {
            $scope.createGroupForm2.availabilityMon.$invalid = true;
            $scope.error.availabilityMon = true;
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
        } else {
            $scope.createGroupForm2.availabilityTues.$invalid = true;
            $scope.error.availabilityTues = true;
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
        } else {
            $scope.createGroupForm2.availabilityWed.$invalid = true;
            $scope.error.availabilityWed = true;
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
        } else {
            $scope.createGroupForm2.availabilityThurs.$invalid = true;
            $scope.error.availabilityThurs = true;
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
        } else {
            $scope.createGroupForm2.availabilityFri.$invalid = true;
            $scope.error.availabilityFri = true;
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
        } else {
            $scope.createGroupForm2.availabilitySat.$invalid = true;
            $scope.error.availabilitySat = true;
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
        } else {
            $scope.createGroupForm2.availabilitySun.$invalid = true;
            $scope.error.availabilitySun = true;
        }*/
        setTimeout(function () {
            $scope.userInput.availability = {
                mon: availabilityForm.availabilityMon.value ? availabilityForm.availabilityMon.value : null,
                tues: availabilityForm.availabilityTues.value ? availabilityForm.availabilityTues.value : null,
                wed: availabilityForm.availabilityWed.value ? availabilityForm.availabilityWed.value : null,
                thurs: availabilityForm.availabilityThurs.value ? availabilityForm.availabilityThurs.value : null,
                fri: availabilityForm.availabilityFri.value ? availabilityForm.availabilityFri.value : null,
                sat: availabilityForm.availabilitySat.value ? availabilityForm.availabilitySat.value : null,
                sun: availabilityForm.availabilitySun.value ? availabilityForm.availabilitySun.value : null
            }
            var hasError = $scope.error.availabilityMon || $scope.error.availabilityTues || $scope.error.availabilityWed || $scope.error.availabilityThurs || $scope.error.availabilityFri || $scope.error.availabilitySat || $scope.error.availabilitySun;
            console.dir($scope.error);
            console.dir($scope.userInput.availability);
            if (hasError) {
                $scope.haveAvailability = false;
            } else {
                if ($scope.userInput.availability.mon || $scope.userInput.availability.tues || $scope.userInput.availability.wed || $scope.userInput.availability.thurs || $scope.userInput.availability.fri || $scope.userInput.availability.sat || $scope.userInput.availability.sun) {
                    $scope.haveAvailability = true;
                } else {
                    $scope.haveAvailability = false;
                }
            }
        }, 200)
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

    var createGroupForm = document.getElementById("createGroupForm");
    $scope.submitForm = function () {
        if (!$scope.createGroupForm.$valid || !$scope.haveAvailability) {
            //empty title
            window.alert("have error")
        } else {
            console.dir($scope.userInput);
            var finalCourse;
            courseObj = $scope.userInput.courseObj ? JSON.parse($scope.userInput.courseObj) : null;
            if (courseObj && courseObj.name) {
                finalCourse = courseObj.name
            } else {
                finalCourse = $scope.userInput.customCourse
                console.log($scope.userInput.customCourse);
            }
            var postData = {
                duration: $scope.userInput.durationHr + ":" + $scope.userInput.durationMin + ":00",
                memberId: $scope.memberId,
                repeatBy: $scope.userInput.repeatBy,
                location: $scope.userInput.location,
                minParticipant: $scope.userInput.minParticipant,
                maxParticipant: $scope.userInput.maxParticipant,
                course: finalCourse,
                level: $scope.userInput.level,
                title: $scope.userInput.title,
                content: $scope.userInput.content,
                availableTime: JSON.stringify($scope.userInput.availability)
            }
            console.dir(postData);
            var dest = baseUrl + '/CreateEvent';
            $.ajax(dest, {
                type: "POST",
                data: postData,
                statusCode: {
                    200: function (response) {
                        alert(response);
                        $scope.$apply(function () {
                            $location.path("/home");
                        });
                    }
                },
                error: function (err) {
                    alert(err);
                }
            });
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

    $scope.$on("$destroy", function () {
        clearInterval(interval);
    });
})