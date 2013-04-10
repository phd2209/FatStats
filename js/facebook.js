// Wrap FB.api with a Deferred
fbWrapper = {

    api: function(url) {
        var deferred = $.Deferred();
        try {
            console.log('calling fb api');
            FB.api(url, function (response) {
                deferred.resolve(response);
            });
        } catch (e) {
            deferred.fail();
        }
        return deferred;
    },

    batch: function (num) {
        var deferred = $.Deferred();
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
                    window.fetches--;

                    var body = JSON.parse(response[0].body);

                    $.each(body.data, function (i, user) {
                        var fbuser = new Object();
                        fbuser.id = user.id;
                        fbuser.name = user.name;
                        fbuser.country = user.locale;
                        fbuser.sex = user.gender;
                        window.userCollection.push(fbuser);
                    });

                    body = JSON.parse(response[1].body);

                    $.each(body, function (id, user) {
                        for (var i = 0; i < window.userCollection.length; i++) {
                            if (id === window.userCollection[i].id) {
                                window.userCollection[i].likes = user.data;
                                window.userCollection[i].likescount = user.data.length;
                                break;
                            }
                        }
                    });

                    if (window.fetches === 0) { deferred.resolve(response) };
                });
            }
        } catch (e) {
            deferred.fail();
        }
        return deferred;
    }
}