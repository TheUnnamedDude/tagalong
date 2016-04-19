'use strict';

function getUploadUrl(uploadId, fallback) {
    if (uploadId) {
        return "/rest/v1/uploads/" + uploadId;
    } else {
        return fallback ? fallback : 'img/placeholder_big.jpg';
    }
}

function skipToContent(skipId){

}

function genericValueMapping(value, key) {
    if (key == 'tagIds') {
        var tagIds = [];
        value.forEach(function(tag) {
            tagIds.push(tag.id);
        });
        if (tagIds.length > 0)
            this.tagIds = tagIds;
    } else {
        this[key] = value;
    }
}

function mapCard(card) {
    card.pages = [];
    var tagIds = [];
    card.filter.forEach(function(value){
        if (value.charAt(0) == '#') { // Its a tag
            tagIds.push(value.substring(1));
        } else { // its a page
            card.pages.push(value);
        }
    }, this);
    this.getByIds(tagIds).then(function(data) {
        card.tags = data;
    });
    card.customBackgroundImageUrl = getUploadUrl(card.customBackgroundImageId);
}


angular.module('tagalong', [
        'ngRoute',
        'ngFileUpload',
        'ui.select',
        'ngImgCrop',
        'ngSanitize',
        'ng-showdown',
        'eventControllers',
        'eventServices',
        'userControllers',
        'userServices',
        'cardControllers',
        'cardServices',
        'commentServices',
        'pageControllers',
        'pageServices',
        'postServices',
        'postControllers',
        'searchControllers',
        'searchServices',
        'staticServices'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when("/events", {
                templateUrl: 'partials/events.html',
                controller: 'ViewEventsCtrl'
            })
            .when("/events/new", {
                templateUrl: 'partials/edit_event.html',
                controller: 'NewEventCtrl'
            })
            .when('/events/:id', {
                templateUrl: 'partials/event.html',
                controller: 'ViewEventCtrl'
            })
            .when("/events/:id/edit", {
                templateUrl: 'partials/edit_event.html',
                controller: 'EditEventCtrl'
            })
            .when("/feed", {
                templateUrl: 'partials/feed.html',
                controller: 'FeedCtrl'
            })
            .when("/pages", {
                templateUrl: 'partials/pages.html',
                controller: 'ShowPagesController'
            })
            .when("/pages/:id", {
                templateUrl: 'partials/page.html',
                controller: 'PageCtrl'
            })
            .when("/pages/:id/edit", {
                templateUrl: 'partials/edit_page.html',
                controller: "EditPageCtrl"
            })
            .when("/", {
                templateUrl: 'partials/cards.html',
                controller: 'AllCardCtrl'
            })
            .when("/cards/:id/edit", {
                templateUrl: 'partials/edit_card.html',
                controller: 'EditCardCtrl'
            })
            .when("/profile", {
                templateUrl: 'partials/other_profiles.html',
                controller: 'ShowUserCtrl'
            })
            .when("/profile/edit", {
                templateUrl: 'partials/edit_profile.html',
                controller: 'EditProfileCtrl'
            })
            .when("/profile/:id", {
                templateUrl: 'partials/other_profiles.html',
                controller: 'ShowUserCtrl'
            });
    }])
    .run(['$rootScope', 'Static', 'User', 'Card', 'Post', function($rootScope, Static, User, Card, Post) {
        $rootScope.updateSelf = function() {
            $rootScope.me = User.find(function(user) {
                if (!user.id) {
                    redirectLogin();
                    return;
                }
                user.profilePictureUrl = getUploadUrl(user.profilePictureId, "img/user_placeholder.png");
                user.profileHeaderPictureUrl = getUploadUrl(user.profileHeaderPictureId);

                if(!localStorage.styleColor){
                    localStorage.styleColor = 'blue';
                }

                $rootScope.changeStylesheet = function(color){
                    localStorage.styleColor = color;
                    $rootScope.styleSheetId = localStorage.styleColor;
                };

                $rootScope.changeStylesheet(localStorage.styleColor);

                $rootScope.goToUrl = function(url){
                    $rootScope.closePopup();
                    window.location = url;
                };
            }, redirectLogin);
        };

        function idMapping(v) {
            return this.find(function(e) {
                return e.id == v;
            });
        }

        $rootScope.allTags = Static.getAllTags();
        $rootScope.allTags.getByIds = function(ids) {
            return $rootScope.allTags.$promise.then(function(allTags) {
                return ids.map(idMapping, allTags);
            });
        };
        $rootScope.studyfields = Static.getAllStudyFields();
        $rootScope.studyfields.getByIds = function(ids) {
            return $rootScope.studyfields.$promise.then(function(allStudyFields) {
                return ids.map(idMapping, allStudyFields);
            });
        };

        $rootScope.updateSelf();

        $rootScope.updateCards = function() {
            $rootScope.cards = Card.all(function(data) {
                data.forEach(mapCard, $rootScope.allTags);
            });
        };
        $rootScope.updateCards();

        $rootScope.newpost = {};

        $rootScope.logout = function() {
            User.logout(redirectLogin);
        };
        $rootScope.addToCard = function(){
            $('.add-to-card-wrap').fadeIn();
            $('#darkOverlay').fadeIn();
        }; // END add to card
        $rootScope.openNewPost = function(doo){
            $('.new-post-wrap').fadeIn();
            $('#darkOverlay').fadeIn();
            // Sjekker om shortcuts skal kjøre eller ikke
            if( doo != 0) $rootScope.openShortcuts(1);
        };
        $rootScope.scrollToPopup = function(){
            $('body').animate({scrollTop: 0}, 300);
        };
        $rootScope.closePopup = function(){
            $('.popup').fadeOut();
            $('#darkOverlay').fadeOut();
            $rootScope.closeShortcuts();
            $('#transparent-overlay').css('display', 'none');
            console.log('Close all');
        };
        $rootScope.createPost = function() {
            var newpost = {};
            angular.forEach($rootScope.newpost, genericValueMapping, newpost);
            newpost.parentId = $rootScope.me.id; // TODO: Select this
            Post.create(newpost);
        };

        var menuOpen = false;
        $rootScope.mobileMenu = function(thatClass){
            $(thatClass).fadeOut();
            if(menuOpen == false){
                //$('body').css('overflow', 'hidden');
                $('.menu').fadeIn();
                $('.bar1').css({ transform: 'rotate(' + 45 + 'deg)' });
                $('.bar1').css('top', '10px');
                $('.bar2').css({ transform: 'rotate(' + -45 + 'deg)' });
                $('.bar2').css('top', '10px');
                $('.bar3').fadeOut();
                menuOpen = true;
            }else if(menuOpen == true){
                //$('body').css('overflow', 'auto');
                $('.menu').fadeOut();
                $('.bar1').css({ transform: 'rotate(' + 0 + 'deg)' });
                $('.bar1').css('top', '0px');
                $('.bar2').css({ transform: 'rotate(' + 0 + 'deg)' });
                $('.bar2').css('top', '20px');
                $('.bar3').fadeIn();
                menuOpen = false;
            }
        };

        var addNewOpen = false;
        $rootScope.openShortcuts = function(dark){
            console.log('yolo');
            if( !addNewOpen ){
                console.log('openShortcuts');
                $('#darkOverlay').fadeIn();
                $('#newPostBtn').stop().css('display', 'block').animate({'bottom': '60px', 'opacity': '1'}, 300);
                $('#newPageBtn').delay(100).css('display', 'block').animate({'bottom': '110px', 'opacity': '1'}, 300);
                $('#newEventBtn').delay(200).css('display', 'block').animate({'bottom': '160px', 'opacity': '1'}, 300);
                $('#newSearchBtn').delay(300).css('display', 'block').animate({'bottom': '210px', 'opacity': '1'}, 300);
                addNewOpen = true;
                return;
            }else{
                console.log('close');
                if( dark != 1) $('#darkOverlay').fadeOut();
                $rootScope.closeShortcuts();
            }

        }; // END openShortcuts

        $rootScope.closeShortcuts = function(){
            addNewOpen = false;
            $('#newSearchBtn').animate({'bottom': '200px', 'opacity': '0'}, 300, function(){ $(this).css('display', 'none'); });
            $('#newEventBtn').delay(100).animate({'bottom': '150px', 'opacity': '0'}, 300, function(){ $(this).css('display', 'none'); });
            $('#newPageBtn').delay(200).animate({'bottom': '100px', 'opacity': '0'}, 300, function(){ $(this).css('display', 'none'); });
            $('#newPostBtn').delay(300).animate({'bottom': '50px', 'opacity': '0'}, 300, function(){ $(this).css('display', 'none'); });
            return;
        };

        var dropdownToggle = false;
        var dropdown = $('.dropdown-content');
        var dropdownArrow = $('.arrow-up');
        $rootScope.openNotifications = function() {
            if(dropdownToggle == false){
                dropdownArrow.fadeIn();
                dropdown.fadeIn();
                dropdownToggle = true;
                $('#transparent-overlay').css('display', 'block');
                console.log('open');
            }else{
                dropdown.fadeOut();
                dropdownArrow.fadeOut();
                dropdownToggle = false;
                $('#transparent-overlay').css('display', 'none');
                console.log('close');

            }
        };

        $(document).mouseup(function (e) {
            var whatIs = $(e.target).attr('id');
            if (whatIs == 'transparent-overlay') {
                dropdown.fadeOut();
                dropdownArrow.fadeOut();
                dropdownToggle = false;
            }
            if (whatIs == 'person-list') {
                $rootScope.openPersonDropdown();
            }
        });
        $rootScope.openCardShortcuts = function(){
            $('.card-shortcut-wrap').fadeIn();
        };
        var personDrop = false;
        $rootScope.openPersonDropdown = function(){
            if( personDrop == false ){
                $('.menu-person-dropdown-mobile').fadeIn(300);
                personDrop = true;
            }else{
                $('.menu-person-dropdown-mobile').fadeOut(300);
                personDrop = false;
            }
        }
    }])
    .directive('galeryImage', function() {
        return {
            restrict: "A",
            link: function(scope, element) {
                scope.getWidth = function() {
                    return $(element).width();
                };
                scope.$watch(scope.getWidth, function(width) {
                    $(element).height(width);
                });
            }
        }
    })
    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });
