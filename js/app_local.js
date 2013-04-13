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
        var slide = fb.slider.slidePage(fb.myCategoriesView.$el).done(function () {
            //fb.spinner.show();
        });
        //var call = fbWrapper.batch(fb.fetches);

        //$.when(slide, call)
        //    .done(function (slideResp, callResp) {
                fb.myCategoriesView.model = fb.getCategories();
                fb.myCategoriesView.render();
        //    })
        //    .fail(function () {
        //        self.showErrorPage();
        //    })
        //    .always(function () {
        //        fb.spinner.hide();
        //    });
    },

    category: function (id) {
        var self = this;
        var view = new fb.views.Category({ template: fb.templateLoader.get('category') });
        var slide = fb.slider.slidePage(view.$el).done(function () {
            //fb.spinner.show();
        });
        view.model = fb.getLikes(id);
        view.render();
        //fb.spinner.hide();
    },
    like: function (id) {
        console.log("LIKE CALLED");
        var self = this;
        var lview = new fb.views.Like({ template: fb.templateLoader.get('like') });
        var slide1 = fb.slider.slidePage(lview.$el).done(function () {
            fb.spinner.show();
        });
        var call2 = fbWrapper.api("/" + id);
        $.when(call2)
            .done(function (callResp) {
                console.log("done");
                lview.model = callResp;
                lview.render();
            })
            .fail(function () {
                console.log("error");
                self.showErrorPage();
            })
            .always(function () {
                console.log("spinner hide");
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
            FB.api('/fql', { 'q': 'SELECT uid, name, locale, friend_count FROM user WHERE uid = me()' }, function (response) {
                fb.user = response; 
                fb.fbid = response.data.uid;
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
    }, { scope: 'publish_actions,email,user_likes,friends_likes,read_stream' });
    return false;
});

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

