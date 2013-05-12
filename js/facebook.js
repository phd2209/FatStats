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
        var batchdef = $.Deferred();
        try {
            console.log('calling fb api in batch'+num);
            for (i = 0; i < num ; i++) {
                FB.api('/', 'POST', {
                    batch: [
                        { method: 'GET', name: 'get-likes', "omit_response_on_success": false, relative_url: 'me/likes'},
                        { method: 'GET', name: 'get-friends', "omit_response_on_success": false, relative_url: 'me/friends?fields=id,name,locale,gender&limit=50&offset=' + i * 50 },
                        { method: 'GET', "omit_response_on_success": false, relative_url: 'likes?ids={result=get-friends:$.data.*.id}' }
                    ]
                }, function (response) {

                    //Count down fetches
                    fb.fetches--;

                    var body = JSON.parse(response[0].body);

                    if (body.data.length > 0) {
                        var fbuser = new Object();
                        fbuser.id = fb.fbid.toString();
                        fbuser.name = fb.name;
                        fbuser.country = fb.country;
                        fbuser.sex = fb.sex;
                        fb.userCollection.push(fbuser);
                        fb.userCollection[0].likes = body.data;
                        fb.userCollection[0].likescount = body.data.length;
                    }

                    var body = JSON.parse(response[1].body);

                    $.each(body.data, function (i, user) {
                        var fbuser = new Object();
                        fbuser.id = user.id;
                        fbuser.name = user.name;
                        fbuser.country = user.locale;
                        fbuser.sex = user.gender;
                        fb.userCollection.push(fbuser);
                    });

                    body = JSON.parse(response[2].body);

                    $.each(body, function (id, user) {
                        for (var i = 0; i < fb.userCollection.length; i++) {
                            if (id === fb.userCollection[i].id) {
                                fb.userCollection[i].likes = user.data;
                                fb.userCollection[i].likescount = user.data.length;
                                break;
                            }
                        }
                    });
                    if (fb.fetches === 0) { batchdef.resolve(response) };
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
    }
}