window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

var fb = new MobileApp();

fb.spinner = $("#spinner");
fb.spinner.hide();

fb.slider = new PageSlider($('#container'));

fb.MobileRouter = Backbone.Router.extend({

    routes: {
        "": "login",
        "welcome": "welcome",
        "categories": "categories",
        "categories/:id": "category",
        "likes/:id": "like"
    },

    login: function () {
        // Reset cached views
        fb.myCategoriesView = null;
        fb.myWelcomeView = null;
        var view = new fb.views.Login();
        fb.slider.slidePageFrom(view.$el, "left");
    },
    welcome: function () {
        var self = this;
        if (fb.myWelcomeView) {
            fb.slider.slidePage(fb.myWelcomeView.$el);
            return;
        }
        fb.myWelcomeView = new fb.views.Welcome({ template: fb.templateLoader.get('welcome') });
        var slide = fb.slider.slidePage(fb.myWelcomeView.$el).done(function () {
            fb.spinner.show();
        });
        var call1 = fbWrapper.batch(fb.fetches);

        $.when(slide, call1)
            .done(function (slideResp, callResp) {
                fb.myWelcomeView.model = fb.getWelcomeMessage();
                fb.myWelcomeView.render();
            })
            .fail(function () {
                self.showErrorPage();
            })
            .always(function () {
                fb.spinner.hide();
            });

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
                fb.user = response; 
                fb.fbid = response.data[0].uid;
                fb.name = response.data[0].name;
                fb.sex = response.data[0].sex;
                fb.fetches = Math.ceil(response.data[0].friend_count / 50);
                fb.country = response.data[0].locale;
                fb.slider.removeCurrentPage();
                fb.router.navigate("welcome", { trigger: true });
            });
        } else {
            fb.user = null; // Reset current FB user
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

    fb.templateLoader.load(['welcome', 'error', 'categories', 'category', 'like', 'login'], function () {
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
    }, { scope: 'publish_actions,user_likes,friends_likes' });
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



/*
$(document).on('click', '.logout', function () {
    FB.logout();
    return false;
});

$(document).on('permissions_revoked', function () {
    // Reset cached views
    fb.myView = null;
    fb.myFriendsView = null;
    return false;
});
*/

