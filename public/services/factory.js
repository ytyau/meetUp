app.factory('categoryList', function () {
    return [
        "Academic",
        "Language",
        "Instruments",
        "Others"
    ]
});

app.factory('langClassList', function () {
    return [{
            "name": "Chinese",
            "level": [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        },
        {
            "name": "English",
            "level": [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        },
        {
            "name": "French",
            "level": [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        },
        {
            "name": "German",
            "level": [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        },
        {
            "name": "Japanese",
            "level": [
                "N1",
                "N2",
                "N3",
                "N4",
                "N5"
            ]
        },
        {
            "name": "Korean",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5"
            ]
        },
        {
            "name": "Spanish",
            "level": [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        }
    ]
});

app.factory('instrumentClassList', function () {
    return [{
            "name": "Acoustic guitar",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Cello",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Clarinet",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Drum",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Electric guitar",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Piano",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Violin",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        },
        {
            "name": "Viola",
            "level": [
                "Level 1",
                "Level 2",
                "Level 3",
                "Level 4",
                "Level 5",
                "Level 6",
                "Level 7",
                "Level 8"
            ]
        }
    ]
});

app.factory('academicClassList', function () {
    return [{
            "name": "Chinese",
            "level": [
                "Kindergarten 1",
                "Kindergarten 2",
                "Kindergarten 3",
                "Primary 1",
                "Primary 2",
                "Primary 3",
                "Primary 4",
                "Primary 5",
                "Primary 6",
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "English",
            "level": [
                "Kindergarten 1",
                "Kindergarten 2",
                "Kindergarten 3",
                "Primary 1",
                "Primary 2",
                "Primary 3",
                "Primary 4",
                "Primary 5",
                "Primary 6",
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Mathematics",
            "level": [
                "Kindergarten 1",
                "Kindergarten 2",
                "Kindergarten 3",
                "Primary 1",
                "Primary 2",
                "Primary 3",
                "Primary 4",
                "Primary 5",
                "Primary 6",
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "General Studies",
            "level": [
                "Primary 1",
                "Primary 2",
                "Primary 3",
                "Primary 4",
                "Primary 5",
                "Primary 6"
            ]
        },
        {
            "name": "Putonghua",
            "level": [
                "Primary 1",
                "Primary 2",
                "Primary 3",
                "Primary 4",
                "Primary 5",
                "Primary 6",
                "Secondary 1",
                "Secondary 2",
                "Secondary 3"
            ]
        },
        {
            "name": "Liberal Studies",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Integrated Humanities",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3"
            ]
        },
        {
            "name": "Integrated Science",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3"
            ]
        },
        {
            "name": "Chinese History",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "History",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Physics",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Chemistry",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Biology",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Chinese Literature",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Literature in English",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Geography",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Economics",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Information and Communication Technology",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        },
        {
            "name": "Visual Arts",
            "level": [
                "Secondary 1",
                "Secondary 2",
                "Secondary 3",
                "Secondary 4",
                "Secondary 5",
                "Secondary 6"
            ]
        }
    ]
});

app.constant('districtList',
    [
        "Islands",
        "Kwai Tsing",
        "North",
        "Sai Kung",
        "Sha Tin",
        "Tai Po",
        "Tsuen Wan",
        "Tuen Mun",
        "Yuen Long",
        "Kowloon City",
        "Kwun Tong",
        "Sham Shui Po",
        "Wong Tai Sin",
        "Yau Tsim Mong",
        "Central & Western",
        "Eastern",
        "Southern",
        "Wan Chai"
    ])