window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

var fb = new MobileApp();

fb.spinner = $("#spinner");
fb.spinner.hide();

fb.slider = new PageSlider($('#container'));

fb.MobileRouter = Backbone.Router.extend({

    routes: {
        "": "welcome",
        "categories": "categories",
        "categories/:id": "category"
    },

    welcome: function () {
        // Reset cached views
        fb.myCategoriesView = null;
        //fb.myFriendsView = null;
        var view = new fb.views.Welcome();
        fb.slider.slidePageFrom(view.$el, "left");
    },

    categories: function () {
        var self = this;
        if (fb.myCategoriesView) {
            fb.slider.slidePage(fb.myCategoriesView.$el);
            return;
        }
        fb.myCategoriesView = new fb.views.Categories({ template: fb.templateLoader.get('categories') });
        var slide = fb.slider.slidePage(fb.myCategoriesView.$el).done(function () {
            fb.spinner.show();
        });
        var call = fbWrapper.batch('/', 'POST', {
            batch: [
                { method: 'GET', name: 'get-friends', "omit_response_on_success": false, relative_url: 'me/friends?fields=id,name,locale,gender&limit=50&offset=' + i * 50 },
                { method: 'GET', "omit_response_on_success": false, relative_url: 'likes?ids={result=get-friends:$.data.*.id}' }
            ]
        }, fetches);

        $.when(slide, call)
            .done(function (slideResp, callResp) {
                fb.myCategoriesView.model = getCategories();
                fb.myCategoriesView.render();
            })
            .fail(function () {
                self.showErrorPage();
            })
            .always(function () {
                fb.spinner.hide();
            });
    },

    category: function (id) {
        var self = this;
        var view = new fb.views.Category({ template: fb.templateLoader.get('category') });
        var slide = fb.slider.slidePage(view.$el).done(function () {
            fb.spinner.show();
        });
        //var call = fbWrapper.api("/" + id);
        var call = getLikes(id);
        $.when(slide, call)
            .done(function (slideResp, callResp) {
                view.model = callResp;
                view.render();
            })
            .fail(function () {
                self.showErrorPage();
            })
            .always(function () {
                fb.spinner.hide();
            });
    }
});

var fbid;
var country;
var fetches;
var userCollection = new Array();
var categories = [];
var selectedcats = [];

$(document).on('ready', function () {

    fb.templateLoader.load(['welcome', 'error', 'categories', 'category'], function () {
        fb.router = new fb.MobileRouter();
        Backbone.history.start();
        FB.init({ appId: "414742111944048", nativeInterface: CDV.FB, useCachedDialogs: false, status: true });
    });

    FB.Event.subscribe('auth.statusChange', function(event) {
        if (event.status === 'connected') {
            FB.api('/fql', { 'q': 'SELECT uid, name, locale, friend_count FROM user WHERE uid = me()' }, function (response) {
                fb.user = response; // Store the newly authenticated FB user
                fbid = response.data.uid;
                fetches = Math.ceil(response.data[0].friend_count / 50);
                country = response.data[0].locale;
                console.log(fb.user);
            });
            fb.slider.removeCurrentPage();
            fb.router.navigate("categories", { trigger: true });
        } else {
            fb.user = null; // Reset current FB user
            fb.router.navigate("", {trigger: true});
        }
    });

});

$(document).on('click', '.button.back', function() {
    window.history.back();
    return false;
});

$(document).on('login', function () {
    FB.login(function(response) {
        console.log("Logged In");
    }, {scope: 'publish_actions,user_status,friends_status,read_stream'});
    return false;
});
/*
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


function getCategories() {

    var totalLikes = 0;
    var sex;
    var number = 15;
    var usersWithLikes = 0;

    for (var j = 0; j < userCollection.length; j++) {
        var obj = userCollection[j];
        totalLikes = totalLikes + obj.likescount;
        insertLikeIndex(likeindex, userCollection[j].likescount, "Total");

        if (obj.likes != undefined | obj.likes == null) {
            usersWithLikes = (obj.likes.length > 0) ? usersWithLikes + 1 : usersWithLikes + 0;
            for (var i = 0; i < obj.likes.length; i++) {

                if (userCollection[j].likes[i].category.toLowerCase() != "community") {
                    insertCategory(categories, userCollection[j].likes[i].category, "Total");
                }
            };
        }
    };

    console.log("Friends with Likes: " + usersWithLikes);
    console.log("Total Likes: " + totalLikes);
    console.log("Number of Categories: " + categories.length);

    sortByNum(categories);
    selectedcats = categories.slice(0, Math.min(categories.length, number));

    for (var j = 0; j < userCollection.length; j++) {
        var obj = userCollection[j];

        sex = obj.sex;
        insertLikeIndex(likeindex, userCollection[j].likescount, sex);
        for (var i = 0; i < obj.likes.length; i++) {

            for (var h = 0; h < selectedcats.length; h++) {
                if (selectedcats[h].category === userCollection[j].likes[i].category && sex != undefined) {
                    insertCategory(selectedcats, userCollection[j].likes[i].category, sex);
                    break;
                }

            }
        };
    };
    CalculatePct(selectedcats);
    return selectedcats;
}

function getLikes(cat) {

    var sex;
    var number = 5;

    for (var j = 0; j < userCollection.length; j++) {
        var obj = userCollection[j];

        sex = obj.sex;
        for (var i = 0; i < obj.likes.length; i++) {

            if (userCollection[j].likes[i].category === cat && sex != undefined) {
                insertlike(likes, userCollection[j].likes[i].name, userCollection[j].likes[i].id, "Total");
            }
        };
    };

    sortByNum(likes);
    selectedlikes = likes.slice(0, Math.min(likes.length, number));

    for (var j = 0; j < userCollection.length; j++) {
        var obj = userCollection[j];

        sex = obj.sex;

        for (var i = 0; i < obj.likes.length; i++) {

            for (var h = 0; h < selectedlikes.length; h++) {
                if (selectedlikes[h].id === userCollection[j].likes[i].id && sex != undefined) {
                    insertlike(selectedlikes, userCollection[j].likes[i].name, userCollection[j].likes[i].id, sex);
                    break;
                }
            }
        };
    };
    CalculatePct(selectedlikes);
    return selectedlikes;
}
//Inserts likes into into an array;
function insertLikeIndex(list, likecount, sex) {

    for (var i = 0; i < list.length; i++) {
        if (likecount === list[i].likecount && sex === list[i].sex) {
            list[i].cnt += 1;
            return;
        }
    }

    var obj;
    obj = { "likecount": likecount, "cnt": 1, "sex": sex };
    list.push(obj);
}

//Inserts categories into into an array;
function insertCategory(list, cat, sex) {

    for (var i = 0; i < list.length; i++) {
        if (cat === list[i].category && sex === list[i].sex) {
            list[i].cnt += 1;
            return;
        }
    }

    var obj;
    obj = { "category": cat, "cnt": 1, "sex": sex };
    list.push(obj);
}

//Inserts likes into into an array;
function insertlike(list, name, id, sex) {
    var obj;

    for (var i = 0; i < list.length; i++) {
        if (id === list[i].id && sex === list[i].sex) {
            list[i].cnt += 1;
            return;
        }
    }
    obj = { "id": id, "name": name, "cnt": 1, "sex": sex };
    list.push(obj);
}
//Utitlity function to calculate pct;
function CalculatePct(list) {
    var total = 0;

    for (var h = 0; h < list.length; h++) {
        total = (list[h].sex.toLowerCase() === "total") ? total + list[h].cnt : total + 0;
    }

    for (var h = 0; h < list.length; h++) {
        list[h].pct = Math.round(list[h].cnt / total * 100);
    }
}
//Utitlity function to sort an array;
function sortByNum(list) {
    list.sort(function (b, a) {
        return a.cnt - b.cnt;
    })
}
