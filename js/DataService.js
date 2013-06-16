

DataService = {

/*  getUserCollection: gets a collection of Users,
    parameters:
      times_to_fetch: number of friends divided by 50
      refresh: false (retrieve data from localStorage is available)
               true  (retrieve data from facebook)
    User attributes:
    id
    name
    gender
    friend_count,  (only loggedin user)
    likescount,
    locale,
    fetches         (only loggedin user)
    fetch_time      (only loggedin user)
    likes[]
*/

    getUserCollection: function (times_to_fetch, refresh) {

        var start = new Date().getTime();
        var batchdef = $.Deferred();
        if (refresh) localStorage.removeItem("likester");

        var temp = localStorage["likester"];
        if (temp != undefined || temp != null) {
            fb.userCollection = JSON.parse(localStorage["likester"]);
            var end = new Date().getTime();
            console.log('getUserCollection Execution time: ' + (end - start) / 1000 + ' sek')
            batchdef.resolve(temp);
            return batchdef;
        };

        var number = times_to_fetch;
        
        try {

            for (i = 0; i < times_to_fetch ; i++) {
                FB.api('/', 'POST', {
                    batch: [
                        { method: 'GET', name: 'get-friends', "omit_response_on_success": false, relative_url: 'me/friends?fields=id,name,locale,gender&limit=50&offset=' + i * 50 },
                        { method: 'GET', "omit_response_on_success": false, relative_url: 'likes?ids={result=get-friends:$.data.*.id}' }
                    ]
                }, function (response) {
                    number--;

                    var users = JSON.parse(response[0].body);
                    var likes = JSON.parse(response[1].body);

                    $.each(users.data, function (i, user) {
                        var fbuser = new Object(user);
                        fb.userCollection.push(fbuser);
                    });

                    $.each(likes, function (id, like) {
                        for (var i = 0; i < fb.userCollection.length; i++) {
                            if (id === fb.userCollection[i].id) {
                                fb.userCollection[i].likes = like.data;
                                fb.userCollection[i].likescount = like.data.length;
                                break;
                            }
                        }
                    });

                    if (number === 0) {
                        localStorage["likester"] = JSON.stringify(fb.userCollection);
                        var end = new Date().getTime();
                        console.log('getUserCollection Execution time: ' + (end - start) / 1000 + ' sek')
                        batchdef.resolve(fb.userCollection);
                    };
                });
                //$.event.trigger("BatchLoad");
            }
        } catch (e) {
            batchdef.fail();
        }
        return batchdef;
    },

/*  getWelcomeModel: creates the welcome class,
    parameters:
      userCollection: collection of users

    WelCome class attributes:    
      totalLikes = 0;
      usersWithLikes = 0;
      malepct = 0;
      femalepct = 0;
      topliker []
      loggedInUser 0 []
*/



    getWelcomeModel: function (userCollection) {

        var start = new Date().getTime();
        //var welcomedef = $.Deferred();
        var userCategories = [];
        var female_count = 0;
        fb.Welcome.totalLikes = 0;
        fb.Welcome.usersWithLikes = 0;
        fb.Welcome.topLiker = userCollection[0];
        fb.Welcome.friend_count = userCollection.length - 1;
        fb.Welcome.countries = [];


        for (var j = 0; j < userCollection.length; j++) {
            if (userCollection[j].likes.length == 0) continue;
            var user = userCollection[j];

            fb.Welcome.totalLikes += user.likes.length;
            fb.Welcome.topLiker = user.likes.length > fb.Welcome.topLiker.likes.length ? user : fb.Welcome.topLiker;
            fb.Welcome.usersWithLikes++;
            female_count = (user.gender === 'female' ? female_count + 1 : female_count + 0);
            if (user.friend_count != undefined || user.friend_count != null) fb.Welcome.loggedinUser = user;

            for (var i = 0; i < user.likes.length; i++) {
                if (user.likes[i].created_time == undefined || user.likes[i].created_time == null) continue;
                var year = user.likes[i].created_time.substr(0, 4);
                if (user.friend_count != undefined || user.friend_count != null)
                    fb.insertCategory(userCategories, user.likes[i].category);
            }
        }
        userCategories = fb.sortByVal(userCategories);
        fb.Welcome.loggedinUser.favorite = userCategories[0].category || "Nothing selected";
        fb.Welcome.topLiker.percent = Math.round((fb.Welcome.topLiker.likescount / fb.Welcome.totalLikes) * 100);
        fb.Welcome.topLiker.likescount = fb.thousandSeparator(fb.Welcome.topLiker.likescount, '.');
        fb.Welcome.loggedinUser.yourPercent = Math.round((fb.Welcome.loggedinUser.likescount / fb.Welcome.totalLikes) * 100);
        fb.Welcome.totalLikes = fb.thousandSeparator(fb.Welcome.totalLikes, '.').substr(0, 4);

        fb.Welcome.femalepct = Math.round((female_count / fb.Welcome.usersWithLikes) * 100);
        fb.Welcome.malepct = 100 - fb.Welcome.femalepct;

        fb.Welcome.thousands = "Målt i antal tusinder";
        if (fb.Welcome.totalLikes < 1000) fb.Welcome.thousands = "Fordelt på dine venner";

        var end = new Date().getTime();
        console.log('getWelcomeModel Execution time: ' + (end - start) / 1000 + ' sek')
        //welcomedef.resolve(fb.Welcome);
        return fb.Welcome;
    },

    /*  getTopLikersCollection: gets a collection of the TopLikers by duration,
    parameters:
      userCollection: collection of users
      duration: 'ALL', 'MONTH', 'WEEK'

    TopLiker attributes:
    id
    name
    gender
    likescount,
    likespct
*/

    getTopLikersCollection: function (userCollection, duration) {

        var start = new Date().getTime();
        //Clearing the topLikers array
        fb.topLikers = [];
        var totalLikesCount = 0;
        for (var j = 0; j < userCollection.length; j++) {
            if (userCollection[j].likes.length == 0) continue;
            var user = userCollection[j];
            var topliker = eval(user.toSource());

            if (topliker.friend_count != undefined || topliker.friend_count != null) {
                topliker.active = true;
            }
            
            if (duration != 'ALL') {
                topliker.likescount = 0;
                for (var i = 0; i < user.likes.length; i++) {
                    if (user.likes[i].created_time == undefined || user.likes[i].created_time == null) continue;
                    
                    if (duration === 'WEEK') {
                        topliker.likescount = (Math.abs((new Date().getTime() - fb.parseFacebookDate(user.likes[i].created_time)) / 86400000) <= 7) ? topliker.likescount + 1 : topliker.likescount + 0;    
                    }
                    else if (duration === 'MONTH')
                        topliker.likescount = (Math.abs((new Date().getTime() - fb.parseFacebookDate(user.likes[i].created_time)) / 86400000) <= 30) ? topliker.likescount + 1 : topliker.likescount + 0;
                }

            }
            totalLikesCount += Number(topliker.likescount);
            topliker.niceNum = fb.getRankingString(topliker.likescount);
            //if likescount is gt 0 put user in topliker array
            if (topliker.likescount > 0)
                fb.topLikers.push(topliker);
        }
        fb.topLikers.sort(fb.sortNumber);
        fb.topLikers.slice(0, Math.min(fb.topLikers.length, 30));
        for (var j = 0; j < fb.topLikers.length; j++) {

            if (fb.topLikers[j].friend_count != undefined || fb.topLikers[j].friend_count != null) {
                fb.topLikers[j].active = true;
            }
            else {
                if (j == fb.topLikers.length) {
                    fb.topLikers.pop();
                    fb.topLikers.push(user);
                }
            }
            fb.topLikers[j].pos = (j + 1);
            fb.topLikers[j].likespct = (fb.topLikers[j].likescount / totalLikesCount * 100).toFixed(1);
        }
        var end = new Date().getTime();
        console.log('getTopLikersCollection Execution time: ' + (end - start)/1000 + ' sek')
        return fb.topLikers;
    },

    /*  getTopLikesCollection: gets a collection of the TopLikes by gender (only 10 first elements),
    parameters:
      userCollection: collection of users
      duration: 'FEMALE', 'MALE', 'ALL'

    TopLiker attributes:
    id
    name
    likescount
*/

    getTopLikesCollection: function (userCollection, sex) {
        var start = new Date().getTime();
        fb.topLikes = [];
        var tempLikes = [];

        for (var j = 0; j < userCollection.length; j++) {
            if (userCollection[j].likes.length == 0) continue;
            var likes = userCollection[j].likes;
            if (sex === 'ALL') {
                $.each(likes, function (id, like) {
                    fb.insertlike(tempLikes, like.name, like.id, "", 0, 0);
                });
            }
            else if (sex.toUpperCase() === userCollection[j].gender.toUpperCase()) {
                $.each(likes, function (id, like) {
                    fb.insertlike(tempLikes, like.name, like.id, "", 0, 0);
                });
            }
        }
        fb.topLikes = tempLikes.sort(fb.sortByNum);
        var list = fb.topLikes.slice(0, Math.min(fb.topLikes.length, 30));
        for (var j = 0; j < list.length; j++) {
            list[j].niceNum = fb.getRankingString(fb.topLikes[j].cnt);
            list[j].pos = (j + 1);
        }
        var end = new Date().getTime();
        console.log('getTopLikesCollection Execution time: ' + (end - start) / 1000 + ' sek')
        return list;
    },




    getPersonLikesById: function (userCollection, id) {
        var start = new Date().getTime();
        var PersonArray = DataService.getTopLikersCollection(userCollection, 'ALL');
        var obj;
        for (var i = 0; i < PersonArray.length; i++) {
            obj = PersonArray[i];
            if (obj.id === id) break;
        };

        var personCategories = [];
        if (obj.likescount == undefined) return obj;
        
        for (var j = 0; j < obj.likes.length; j++) {
            fb.insertCategory(personCategories, obj.likes[j].category);
        }
        personCategories = fb.sortByVal(personCategories);
        obj.winner = false;
        obj.rank = fb.getRankingString((obj.pos));
        obj.num = obj.pos;
        if(obj.rank === 0) obj.winner = true;
        obj.favorite = personCategories[0].category || "?";
        var end = new Date().getTime();
        console.log('getPersonLikesById Execution time: ' + (end - start) / 1000 + ' sek')
        return obj;
    }
};





