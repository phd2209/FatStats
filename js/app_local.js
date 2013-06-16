window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

//window.addEventListener('BatchLoad', function () {
//    console.log("new batch loaded");
//}, false);


var fb = new MobileApp();
fb.his;
fb.spinner = $("#spinner");
fb.spinner.hide();

fb.slider = new PageSlider($('#container'));

fb.MobileRouter = Backbone.Router.extend({

    routes: {
        "": "login",
        "menu": "menu",
        "welcome": "welcome",
        "toplikers": "toplikers",
        "toplikes": "toplikes",
        "categories": "categories",
        "person/:id": "person",
        "categories/:id": "category",
        "likes/:id": "like",
        "photos": "photos"
    },

    login: function () {
        // Reset cached views
        fb.myCategoriesView = null;
        fb.myWelcomeView = null;
        var view = new fb.views.Login();
        fb.slider.slidePageFrom(view.$el, "left");
    },

    menu: function () {
        var self = this;
        if (fb.myMenuView) {
            fb.slider.slidePage(fb.myMenuView.$el);
            return;
        }
        fb.myMenuView = new fb.views.Menu({ template: fb.templateLoader.get('menu') });
        var slide = fb.slider.slidePage(fb.myMenuView.$el).done(function () {
            // fb.spinner.show();
        });
        fb.myWelcomeView.render();
        $('#close-btn').attr("href", '#' + fb.his);
    },

    welcome: function () {
        fb.his = Backbone.history.fragment;
        var self = this;
        if (fb.myWelcomeView) {
            fb.slider.slidePage(fb.myWelcomeView.$el);
            return;
        }
        fb.myWelcomeView = new fb.views.Welcome({ template: fb.templateLoader.get('welcome') });
        var slide = fb.slider.slidePage(fb.myWelcomeView.$el).done(function () {
            fb.spinner.show();
        });

        var call1 = DataService.getUserCollection(fb.myuser.fetches, false);

        $.when(slide, call1)
            .done(function (slideResp, callResp) {

                //var test1 = DataService.getTopLikersCollection(fb.userCollection, 'ALL');
                //var test2 = DataService.getTopLikersCollection(fb.userCollection, 'WEEK');
                //var test3 = DataService.getTopLikersCollection(fb.userCollection, 'MONTH');

                //var test4 = DataService.getTopLikesCollection(fb.userCollection, 'ALL');
                //var test5 = DataService.getTopLikesCollection(fb.userCollection, 'MALE');
                //var test6 = DataService.getTopLikesCollection(fb.userCollection, 'FEMALE');

                fb.myWelcomeView.model = DataService.getWelcomeModel(fb.userCollection);
                fb.myWelcomeView.render();
            })
            .fail(function () {
                self.showErrorPage();
            })
            .always(function () {
                fb.spinner.hide();
            });
    },

    toplikers: function () {
        console.log("Entered toplikers");
        var self = this;
        var view = new fb.views.Toplikers({ template: fb.templateLoader.get('toplikers') }); 
        fb.slider.slidePage(view.$el);
        view.model = DataService.getTopLikersCollection(fb.userCollection, 'ALL');
        view.render();
    },

    toplikes: function () {
        console.log("Entered toplikes");
        var self = this;
        var view = new fb.views.Toplikes({ template: fb.templateLoader.get('toplikes') });
        fb.slider.slidePage(view.$el);
        view.model = DataService.getTopLikesCollection(fb.userCollection, 'ALL');
        view.render();
    },

    categories: function () {
        console.log("Entered Categories");
        var self = this;
        if (fb.myCategoriesView) {
            fb.slider.slidePage(fb.myCategoriesView.$el);
            return;
        }
        fb.myCategoriesView = new fb.views.Categories({ template: fb.templateLoader.get('categories') });
        fb.slider.slidePage(fb.myCategoriesView.$el)
        fb.myCategoriesView.model = fb.getCategories();
        fb.myCategoriesView.render();
    },

    category: function (id) {
        var self = this;
        var view = new fb.views.Category({ template: fb.templateLoader.get('category') });
        fb.slider.slidePage(view.$el);
        view.model = fb.getLikes(id);
        view.render();
    },

    like: function (id) {
        var self = this;
        var view = new fb.views.Like({ template: fb.templateLoader.get('like') });
        fb.slider.slidePage(view.$el);
        fb.spinner.show();       
        var call = fbWrapper.api("/" + id);
        $.when(call)
            .done(function (callResp) {
                fb.spinner.hide();
                view.model = callResp;
                view.render();
            })
            .fail(function () {
                fb.spinner.hide();
                self.showErrorPage();
            })
            .always(function () {
                fb.spinner.hide();
            });
    },
    person: function (id) {
        var self = this;
        var view = new fb.views.Person({ template: fb.templateLoader.get('person') });
        var slide = fb.slider.slidePage(view.$el).done(function () {
            fb.spinner.show();
        });
        view.model = DataService.getPersonLikesById(fb.userCollection, id);
        view.render();
    },

    photos: function () {
        var self = this;
        console.log("Entered Photos");
        var view = new fb.views.TopPhotos({ template: fb.templateLoader.get('topphotos') });
        fb.slider.slidePage(view.$el);
        fb.spinner.show();
        var call = fbWrapper.photo(fb.fetches);
        $.when(call)
            .done(function (callResp) {
                fb.spinner.hide();
                view.model = callResp;
                view.render();
            })
            .fail(function () {
                fb.spinner.hide();
                self.showErrorPage();
            })
            .always(function () {
                fb.spinner.hide();
            });
    }
});

window.fbAsyncInit = function () {

    FB.init({
        appId: '414742111944048',
        status: false,
        cookie: true,
        xfbml: true,
        frictionlessRequests: true,
        useCachedDialogs: true,
        oauth: true
    });

    FB.Event.subscribe('auth.statusChange', function(event) {
        if (event.status === 'connected') {
            FB.api('/fql', { 'q': 'SELECT uid, name, sex, locale, friend_count FROM user WHERE uid = me()' }, function (response) {

                fb.myuser = new Object({ id: response.data[0].uid.toString(), name: response.data[0].name, gender: response.data[0].sex, locale: response.data[0].locale, friend_count: response.data[0].friend_count });
                fb.myuser.fetches = Math.ceil(response.data[0].friend_count / 50);
                fb.myuser.fetch_time = Math.round(new Date().getTime() / 1000);

                FB.api('me/likes', function (resp) {
                    fb.myuser.likes = resp.data;
                    fb.myuser.likescount = resp.data.length;
                    fb.userCollection.push(fb.myuser);
                    fb.slider.removeCurrentPage();
                    fb.router.navigate("welcome", { trigger: true });
                });
            });
        } else {
            fb.myuser = null; // Reset current FB user
            fb.fbid = "";
            fb.name = "";
            fb.sex = "";
            fb.fetches = 0;
            fb.country = "";
            fb.userCollection = [];
            fb.router.navigate("", {trigger: true});
        }
    });    
};

(function (d) {
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));

document.addEventListener("deviceready", onDeviceReady, false);

$(document).on('ready', function () {

    fb.templateLoader.load(['welcome', 'menu', 'error', 'categories', 'category', 'like', 'login', 'toplikers', 'toplikes', 'topphotos', 'person'], function () {
        fb.router = new fb.MobileRouter();
        Backbone.history.start();
    });
});

$(document).on('click', '.button.back', function() {
    window.history.back();
    return false;
});

$(document).on('login', function () {
    FB.login(function(response) {
        console.log("Logged In");
    }, { scope: 'user_likes,friends_likes,user_photos,friends_photos' });
    return false;
});

function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
}

function onPause() {
    fb.lastUpdate = new Date();
}

function onResume() {
    var currentDate = new Date();
    if ((currentDate.getTime() - fb.lastUpdate.getTime() / 86400000) >= 2) {
        //fb.router.navigate("welcome", { trigger: true });
    }
}

$(document).on('click', '.logout', function () {
    FB.logout();
    return false;
});
/*
$(document).on('permissions_revoked', function () {
    // Reset cached views
    fb.myView = null;
    fb.myFriendsView = null;
    return false;
});
*/

