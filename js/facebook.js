// Wrap FB.api with a Deferred
fbWrapper = {

    api: function(url) {
        var apidef = $.Deferred();
        try {
            console.log('calling fb api');
            FB.api(url, function (response) {
                apidef.resolve(response);
            });
        } catch (e) {
            apidef.fail();
        }
        return apidef;
    },

    batch: function (num) {
        var number = num;
        var batchdef = $.Deferred();
        try {

            console.log('calling fb api in batch'+num);
            for (i = 0; i < num ; i++) {
                FB.api('/', 'POST', {
                    batch: [
                        { method: 'GET', name: 'get-friends', "omit_response_on_success": false, relative_url: 'me/friends?fields=id,name,locale,gender&limit=50&offset=' + i * 50 },
                        { method: 'GET', "omit_response_on_success": false, relative_url: 'likes?ids={result=get-friends:$.data.*.id}' }
                    ]
                }, function (response) {
                    var start = new Date().getTime();
                    number--;

                    var body = JSON.parse(response[0].body);

                    $.each(body.data, function (i, user) {
                        var fbuser = new Object(user);
                        fb.userCollection.push(fbuser);
                    });

                    body = JSON.parse(response[1].body);

                    $.each(body, function (id, user) {
                        for (var i = 0; i < fb.userCollection.length; i++) {
                            if (id === fb.userCollection[i].id) {
                                fb.userCollection[i].likes = user.data;
                                fb.userCollection[i].likescount = user.data.length;
                                break;
                            }
                        }
                    });
                    
                    if (number === 0) {
                        var end = new Date().getTime();
                        console.log('batch Execution time: ' + (end - start))
                        console.dir(fb.userCollection);
                        batchdef.resolve(response);
                    };
                });
            }
        } catch (e) {
            batchdef.fail();
        }
        return batchdef;
    },

    photo: function (num) {
        var photos = [];
        var photodef = $.Deferred();
        try {
            console.log('calling fb api in batch'+num);
            FB.api('/fql', { 'q': ' SELECT pid, like_info, object_id, caption, aid, owner, link, src_big, src_small, created, modified FROM photo WHERE aid IN (SELECT aid FROM album WHERE owner IN (SELECT uid2 FROM friend WHERE uid1=me())) ORDER BY like_info desc LIMIT 15' }, function (resp) {

                // check for a valid response
                if (resp == "undefined" || resp == null || !resp || resp.error) {
                    photodef.fail();
                }

                for (var i = 0; i < resp.data.length; i++) {
                    //console.log(resp.data[i]);
                    var obj = resp.data[i];
                    obj = { "id": obj.pid, "like_info": obj.like_info, "caption": obj.caption, "owner": obj.owner, "bigpic": obj.src_big, "smallpic": obj.src_small };
                    photos.push(obj);
                }
                console.log(photos);
                photodef.resolve(photos)
            });
        } catch (e) {
            photodef.fail();
        }
        return photodef;
    },

    checkUserPermissions: function (permissionToCheck) {
        FB.api("/me/permissions",
            function (response) {
                if (response.data[0][permissionToCheck] === 1)
                    return true;
                return false;
            });
        return true;
    },

    promptPermission: function(permission) {
        FB.login(function(response) {
            if (response.authResponse) {
                this.checkUserPermissions(permission)
            }
        }, {scope: permission});
    },

    //Publish a story to the user's own wall
    publishStory: function() {
        FB.ui({
            method: 'feed',
            name: 'Top3 likers in your social network',
            caption: 'FatStats: Top 3 likers',
            description: 'Check out FatStats for Mobile to learn more about what your social network likes.',
            link: 'http://apps.facebook.com/fatstats/',
            picture: 'http://www.facebookmobileweb.com/hackbook/img/facebook_icon_large.png',
            actions: [{ name: 'Get Started', link: 'http://apps.facebook.com/fatstats/' }],
        },
        function(response) {
            console.log('publishStory UI response: ', response);
            if (response && response.post_id) {
                console.log('Your post was published.');
            } else {
                console.log('Your post was not published.');
            }
        });
    },

    uninstallApp: function () {
        FB.api('/me/permissions', 'DELETE',
        function (response) {
            FB.logout();
            return false;
        });
    }
}