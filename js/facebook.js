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
                        { method: 'GET', name: 'get-friends', "omit_response_on_success": false, relative_url: 'me/friends?fields=id,name,locale,gender&limit=50&offset=' + i * 50 },
                        { method: 'GET', "omit_response_on_success": false, relative_url: 'likes?ids={result=get-friends:$.data.*.id}' }
                    ]
                }, function (response) {

                    //Count down fetches
                    fb.fetches--;

                    var body = JSON.parse(response[0].body);

                    $.each(body.data, function (i, user) {
                        var fbuser = new Object();
                        fbuser.id = user.id;
                        fbuser.name = user.name;
                        fbuser.country = user.locale;
                        fbuser.sex = user.gender;
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

                    if (fb.fetches === 0) { batchdef.resolve(response) };
                });
            }
        } catch (e) {
            batchdef.fail();
        }
        return batchdef;
    }
}