var baseUrl = "";
var restUrl = baseUrl + "/rest/v1";

var cardServices = angular.module('cardServices', ['ngResource']);
var eventServices = angular.module('eventServices', ['ngResource']);
var loginServices = angular.module('loginServices', ['ngResource']);
var pageServices = angular.module('pageServices', ['ngResource']);
var postServices = angular.module('postServices', ['ngResource']);
var userServices = angular.module('userServices', ['ngResource']);
var searchServices = angular.module('searchServices', ['ngResource']);
var uploadsServices = angular.module('uploadServices', ['ngResource']);
var staticServices = angular.module('staticServices', ['ngResource']);
var commentServices = angular.module('commentServices', ['ngResource']);

var transform = function(data){
    return $.param(data);
};

// TODO: Transform post bodies here instead of in each controller
function transformPost(data) {

}

loginServices.factory('Login', ['$resource', function($resource) {
    return $resource(baseUrl + "/rest/login", {}, {
        login: {
            method: 'POST',
            isArray: false,
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform
        }
    })
}]);

eventServices.factory('Event', ['$resource', function($resource) {
    return $resource(url('/events'), {}, {
        create: {
            method: 'POST'
        },
        update: {
            method: 'PATCH'
        },
        all: {
            method: 'GET',
            isArray: true
        },
        getById: {
            method: 'GET',
            isArray: false,
            url: url('/events/:eventId')
        }
    });
}]);

userServices.factory('User', ['$resource', function($resource) {
    return $resource(url("/users/:userId"), {}, {
        update: {
            url: url("/users"),
            method: 'PATCH',
            isArray: false
        },
        create: {
            url: url("/users"),
            method: 'POST',
            isArray: false
        },
        find: {
            method: 'GET',
            isArray: false,
            params: {userId: 'me'}
        },
        logout: {
            url: baseUrl + "/rest/logout",
            method: 'POST'
        }
    })
}]);

cardServices.factory('Card', ['$resource', function($resource) {
    return $resource(url("/cards"), {}, {
        create: {
            method: 'POST',
            isArray: false
        },
        all: {
            method: 'GET',
            isArray: true
        },
        get: {
            method: 'GET',
            isArray: false,
            url: url('/cards/:cardId')
        }
    })
}]);

commentServices.factory('Comment', ['$resource', function ($resource) {
    return $resource(url('/comments'), {}, {
        create: {
            method: 'POST',
            isArray: false
        },
        getByPost: {
            url: url('/comments/by-post/:postId'),
            isArray: true,
            method: 'GET'
        }
    })
}]);

pageServices.factory('Page', ['$resource', function($resource) {
    return $resource(url('/pages'), {}, {
        create: {
            method: 'POST',
            isArray: false
        },
        query: {
            url: url('/pages/:pageId'),
            method: 'GET',
            isArray: false
        },
        all: {
            method: 'GET',
            isArray: true
        },
        update: {
            url: url("/pages/:pageId"),
            method: 'PATCH',
            isArray: false
        }
    })
}]);

postServices.factory('Post', ['$resource', function($resource) {
    return $resource(url("/posts"), {postId: '@id'}, {
        create: {
            method: 'POST'
        },
        find: {
            isArray: true
        },
        remove: {
            url: url('/posts/:postId'),
            method: 'DELETE'
        },
        upvote: {
            url: url('/posts/:postId/upvote'),
            method: 'POST',
            isArray: false
        },
        getByTags: {
            url: url('/posts/by-tags/:tags'),
            method: 'GET',
            isArray: true
        }
    })
}]);

searchServices.factory('Search', ['$resource', function($resource) {
    return $resource(url("/search"), {}, {
        queryAll: {
            method: 'GET',
            isArray: true
        }
    })
}]);

staticServices.factory('Static', ['$resource', function($resource) {
    return $resource(url("/static/studyfield"), {}, {
        getAllStudyFields: {
            isArray: true
        },
        getAllTags: {
            url: url("/static/tags"),
            isArray: true
        }
    })
}]);

function url(v) {
    return restUrl + v;
}