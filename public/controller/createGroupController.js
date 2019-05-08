app.controller('CreateGroupController', function ($scope, $location, $cookieStore, $cookies, $filter, districtList, categoryList, langClassList, instrumentClassList, academicClassList) {

    $scope.role = "Guest";
    const baseUrl = 'http://localhost:3000';
    const cookiesAlivePeriod = 30 * 60 * 1000; // 30 mins
    const cookies_memberInfo = "username";
    const cookies_memberId = "memberId";

    /*********** Check if Logged in Start ***********/
    if (!$cookies.get(cookies_memberInfo)) {
        $location.path("/login");
    } else {
        $scope.memberId = $cookies.get(cookies_memberId);
        $scope.memberInfo = $cookies.get(cookies_memberInfo);
    }
    /*********** Check if Logged in End ***********/

    $scope.categorySelected = '';
    $scope.displayCourseList = [];
    $scope.displayLevelList = [];
    $scope.districtList = districtList;
    $scope.categoryList = categoryList;
    $scope.haveAvailability = false;

    $scope.userInput = {
        repeatBy: "", //1 week, 2 week, 1 month
        location: "",
        minParticipant: "",
        maxParticipant: "",
        courseObj: null,
        customCourse: "",
        level: "",
        title: "",
        content: "",
    }
    $scope.availability = {
        mon: "",
        tues: "",
        wed: "",
        thurs: "",
        fri: "",
        sat: "",
        sun: ""
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

    $scope.availabilityChange = function () {
        //update availability
        setTimeout(function () {
            console.dir($scope.availability);
            var availabilityForm = document.getElementById("createGroupForm2");
            /*$scope.userInput.availability = {
                mon: availabilityForm.availabilityMon ? availabilityForm.availabilityMon.value : availability.mon,
                tues: availabilityForm.availabilityTues ? availabilityForm.availabilityTues.value : availability.tues,
                wed: availabilityForm.availabilityWed ? availabilityForm.availabilityWed.value : availability.wed,
                thurs: availabilityForm.availabilityThurs ? availabilityForm.availabilityThurs.value : availability.thurs,
                fri: availabilityForm.availabilityFri ? availabilityForm.availabilityFri.value : availability.fri,
                sat: availabilityForm.availabilitySat ? availabilityForm.availabilitySat.value : availability.sat,
                sun: availabilityForm.availabilitySun ? availabilityForm.availabilitySun.value : availability.sun
            }*/
            var matches;
            if (availabilityForm.availabilityMon.value) {
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
                    if (checkTimeValidity(range)) {
                        /*if ($('#availabilityMon').hasClass('is-invalid')) {
                            $('#availabilityMon').removeClass('is-invalid');
                        }
                        $scope.error.availabilityMon = false;*/
                        $scope.createGroupForm2.availability.mon.$invalid = false;
                    } else {
                        $scope.createGroupForm2.availability.mon.$invalid = true;
                        console.log('start debug!!!!');
                        console.dir($scope.createGroupForm2.userInput.availability.mon);
                    }
                }
            }
            if ($scope.error.availabilityMon) {
                $scope.createGroupForm2.$invalid = true
            } else {
                $scope.createGroupForm2.$invalid = false
            }
        }, 500)
    }

    function checkTimeValidity(range) {
        if (range.from.hour > range.to.hour) {
            return false;
        } else if (range.from.hour == range.to.hour) {
            if (range.from.minute >= range.to.minute) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    var createGroupForm = document.getElementById("createGroupForm");
    $scope.submitForm = function () {
        if ($scope.createGroupForm.$error) {
            //empty title
            window.alert("have error")
        } else {
            var finalCourse;
            if ($scope.userInput.courseObj) {
                finalCourse = JSON.parse($scope.userInput.courseObj).name
            } else {
                finalCourse = $scope.userInput.customCourse
            }
            var postData = {
                memberId: $scope.memberId,
                repeatBy: $scope.userInput.repeatBy,
                location: $scope.userInput.location,
                minParticipant: $scope.userInput.minParticipant,
                maxParticipant: $scope.userInput.maxParticipant,
                course: finalCourse,
                level: $scope.userInput.level,
                title: $scope.userInput.title,
                content: $scope.userInput.content
            }
            console.dir(postData);
        }

    }
})