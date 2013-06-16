var MobileApp = function() {

    this.initialize = function () {
        //this.fbid = "";
        //this.lastUpdate = new Date();
        //this.name = "";
        //this.country = "";
        this.models = {};
        this.views = {};
        this.userCollection = [];
        this.Welcome = new Object();
        this.topLikers = [];
        this.topLikes = [];
        this.templateLoader = new this.TemplateLoader();
    };

    this.TemplateLoader = function () {
        this.templates = {};
        this.load = function (names, callback) {

            var deferreds = [],
                self = this;

            $.each(names, function (index, name) {
                deferreds.push($.get('tpl/' + name + '.html', function (data) {
                    self.templates[name] = Handlebars.compile(data);
                }));
            });

            $.when.apply(null, deferreds).done(callback);
        };

        // Get template by name from hash of preloaded templates
        this.get = function (name) {
            return this.templates[name];
        };
    };

    this.alert = function(message, title) {
        if (typeof(title)==='undefined') title = "Sociogram";
        if (navigator.notification) {
            navigator.notification.alert(
                message,
                null, // callback
                title,
                'OK' // Button label
            );
        } else {
            alert(title + ": " + message);
        }
    };
    /*
    this.getMenuButtons = function () {
        var Options = function () {
            this.totalLikes = 0;
            this.usersWithLikes = 0;
            this.country = 0;
            this.genders = [];
            this.years = [];
            this.fbid = 0;
            this.name = "";
            this.thousands = "Målt i antal tusinder";
        };
        var opt = new Options();
        return opt;
    };
    
    this.getWelcomeMessage = function() {

        var Welcome = function () {
            this.fbid = 0;
            this.name = "";
            this.totalLikes = 0;
            this.usersWithLikes = 0;
            this.country = 0;
            this.genders = [];
            this.years = [];
        };
        var wel = new Welcome();
        wel.name = fb.name;
        wel.fbid = fb.fbid;
        var countries = [];

        for (var j = 0; j < this.userCollection.length; j++) {           
            var obj = this.userCollection[j];
            
            wel.totalLikes = wel.totalLikes + obj.likescount;

            // create genders array;
            if (!_.contains(wel.genders, obj.sex) && obj.sex != undefined) wel.genders.push(obj.sex);
    
            // create country array;
            if (!_.contains(countries, obj.country) && obj.country != undefined) countries.push(obj.country);
    
            if (obj.likes != undefined | obj.likes == null) {
                wel.usersWithLikes = (obj.likes.length > 0) ? wel.usersWithLikes + 1 : wel.usersWithLikes + 0;
                for (var i = 0; i < obj.likes.length; i++) {
                    // create years array;
                    if (this.userCollection[j].likes[i].created_time != undefined) {
                        var year = this.userCollection[j].likes[i].created_time.substr(0, 4);
                        if (!_.contains(wel.years, year) && year != undefined)  wel.years.push(year);
                    }
                };
            }
        };
        wel.country = countries.length;
        return wel;
    };
    */

    this.getWelcomeMessage = function () {
        var start = new Date().getTime();
        var Welcome = function () {
            this.totalLikes = 0;
            this.usersWithLikes = 0;
            this.malepct = 0;
            this.femalepct = 0;
            this.toplikerName = "";
            this.topLikerId = "";
            this.topLikerCount = 0;
            this.topLikerPercent = 0;
            this.country = 0;
            this.genders = [];
            this.years = [];
            this.fbid = 0;
            this.name = "";
            this.yourPercent = 0;
            this.likescount = 0;
            this.friend_count;
            this.avflikecount = 0;
            this.thousands = "Målt i antal tusinder";
        };
        var wel = new Welcome();
        var countries = [];
        wel.name = fb.name;
        var topLiker = { 'likescount': 0 };
        //var yourLikeCount = 0;
        var hasMatch = false;
        var userCats = [];
        //var girls = 0;
        wel.friend_count = this.userCollection.length;
        for (var j = 0; j < this.userCollection.length; j++) {

            if (this.userCollection[j].likes.length == 0) continue;
            var obj = this.userCollection[j];

            if (obj.likescount == null || obj.likescount == undefined) continue;

            //if (obj.likescount != null || obj.likescount != undefined) {
            wel.totalLikes += obj.likescount;
            //}
            topLiker = (obj.likescount > topLiker.likescount) ? obj : topLiker;

            if (obj.name === fb.name && !hasMatch) {
                hasMatch = true;
                userCats = obj.likes;
                wel.likescount = obj.likescount;
            }

            var toplikersElem = new Object();
            toplikersElem.id = obj.id;
            toplikersElem.name = obj.name;
            toplikersElem.likescount = obj.likescount;
            toplikersElem.likescountweek = 0;
            toplikersElem.likescountmonth = 0;

            //if (!_.contains(wel.genders, obj.sex) && obj.sex != undefined) wel.genders.push(obj.sex);

            // create country array;
            if (!_.contains(countries, obj.country) && obj.country != undefined) countries.push(obj.country);

            if (obj.likes == undefined || obj.likes == null) continue;
            //if (obj.likes != undefined || obj.likes != null) {
                
                wel.usersWithLikes = (obj.likes.length > 0) ? wel.usersWithLikes + 1 : wel.usersWithLikes + 0;
                for (var i = 0; i < obj.likes.length; i++) {
                    // create years array;
                    if (this.userCollection[j].likes[i].created_time != undefined) {
                        var year = this.userCollection[j].likes[i].created_time.substr(0, 4);
                        if (!_.contains(wel.years, year) && year != undefined) wel.years.push(year);

                        toplikersElem.likescountweek = (Math.abs((new Date().getTime() - fb.parseFacebookDate(this.userCollection[j].likes[i].created_time)) / 86400000) <= 7) ? toplikersElem.likescountweek + 1 : toplikersElem.likescountweek + 0;
                        toplikersElem.likescountmonth = (Math.abs((new Date().getTime() - fb.parseFacebookDate(this.userCollection[j].likes[i].created_time)) / 86400000) <= 30) ? toplikersElem.likescountmonth + 1 : toplikersElem.likescountmonth + 0;

                    }
                };
            //}

            fb.topLikers.push(toplikersElem);
        };
        
        var females = _.where(this.userCollection, { sex: "female" });
        var femeCnt = 0;
        for (var i = 0; i < females.length; i++) {
            if (females[i].likes.length > 0) femeCnt++;
        };
        wel.femalepct = Math.round((femeCnt / wel.usersWithLikes) * 100);
        wel.malepct = 100 - wel.femalepct;

        var userCategories = [];
        wel.likescount = 0;
        for (var i = 0; i < userCats.length; i++) {
            //if(userCats[i].category != "Community") {
            this.insertCategory(userCategories, userCats[i].category);
            wel.likescount++;
            //}

        };
        //console.log("wel.likescount with no community " + wel.likescount);
        this.sortByNum(userCategories);
        //70 kategorier
        //console.dir(userCategories)
        var topcategorieesforuser; //hvis mindre end 9 så vis dem, ellers 9 + resten
        var loopcount = Math.min(userCategories.length, 8);
        var donutColors = ["#660066", "#990099", "#476aa4", "#cc00cc", "#d9c3e9", "#55c6e4", "#55c6ec", "#55ccc", "#ccc"];
        //console.log("loopcount " + loopcount) 
        wel.donutObj = [];
        for (var i = 0; i < loopcount; i++) {
            var obj;
            if (i == loopcount) {

                var max = 0;
                for (var j = loopcount; j < userCategories.length; j++) {
                    max += userCategories[j].cnt;
                };
                obj = { value: Math.round(360 * (max / wel.likescount)), color: donutColors[i] };

                //break;
            }
            else {
                //console.log("userCategories[i].cnt " + userCategories[i].cnt)
                obj = { value: Math.round(360 * (userCategories[i].cnt / wel.likescount)), color: donutColors[i] };

            }
            wel.donutObj.push(obj);
            console.log(this.topLikers);
            /* userCategories[i]*/
        };
        //console.dir(wel.donutObj);

        wel.yourPercent = Math.round(wel.likescount / wel.totalLikes * 100);
        wel.toplikerName = topLiker.name;
        wel.topLikerId = topLiker.id;
        wel.topLikerCount = this.thousandSeparator(topLiker.likescount, '.');
        wel.topLikerPercent = Math.round(topLiker.likescount / wel.totalLikes * 100);
        wel.avflikecount = Math.round(wel.totalLikes / this.userCollection.length);

        if (wel.totalLikes < 1000) wel.thousands = "Fordelt på dine venner";
        wel.country = countries.length;
        wel.fbid = fb.fbid;// "1395743517";//fb.fbid;
        wel.totalLikes = this.thousandSeparator(wel.totalLikes, '.').substr(0, 4);// "12.3";
        //wel.name = fb.name;//fb.user.data[0].name;
        //console.log(this.thousandSeparator('20002003', '.'))
        var end = new Date().getTime();
        console.log('getWelcomeMessage Execution time: ' + (end - start))
        return wel;
    };

    /*
    this.getCategories = function() {

        var males = 0;
        var females = 0;
        var categories = [];

        for (var j = 0; j < this.userCollection.length; j++) {
            var obj = this.userCollection[j];

            if (obj.sex != undefined) {
                males = (obj.sex.toLowerCase() === "male") ? 1 : 0;
                females = (obj.sex.toLowerCase() === "female") ? 1 : 0;
            }
                //totalLikes = totalLikes + obj.likescount;
            //insertLikeIndex(likeindex, userCollection[j].likescount, "Total");

            if (obj.likes != undefined | obj.likes == null) {
                for (var i = 0; i < obj.likes.length; i++) {

                    //if (this.userCollection[j].likes[i].category.toLowerCase() != "community") {
                        this.userCollection[j].likes[i].link = this.userCollection[j].likes[i].category.replace(new RegExp("/", 'g'), "-");
                        this.insertCategory(categories, this.userCollection[j].likes[i].category, males, females);
                    //}
                };
            }
        };

        this.sortByNum(categories);
        var selectedcats = categories.slice(0, Math.min(categories.length, 1000));
        return this.removeSmallLikes(selectedcats);
    }
    
    this.getLikes = function(cat) {
        var males = 0;
        var females = 0;
        var number = 1000;
        var likes = [];

        for (var j = 0; j < this.userCollection.length; j++) {
            var obj = this.userCollection[j];

            if (obj.sex != undefined) {
                males = (obj.sex.toLowerCase() === "male") ? 1 : 0;
                females = (obj.sex.toLowerCase() === "female") ? 1 : 0;
            }

            for (var i = 0; i < obj.likes.length; i++) {

                if (this.userCollection[j].likes[i].link === decodeURIComponent(cat.trim())) {
                    this.insertlike(likes, this.userCollection[j].likes[i].name, this.userCollection[j].likes[i].id, cat, males, females);
                }
            };
        };

        this.sortByNum(likes);
        var selectedlikes = likes.slice(0, Math.min(likes.length, number));
        console.log(selectedlikes);
        return selectedlikes;
    }
    */
    this.insertCategory = function(list, cat) {

        for (var i = 0; i < list.length; i++) {
            if (cat === list[i].category) {
                list[i].cnt += 1;
                return;
            }
        }

        var obj;
        var link = cat.replace(new RegExp("/", 'g'), "-");
        obj = { "category": cat, "link": link, "cnt": 1 };
        list.push(obj);
    }

    this.insertlike = function(list, name, id, cat, males, females) {

        for (var i = 0; i < list.length; i++) {
            if (id === list[i].id) {
                list[i].cnt += 1;
                list[i].males += males;
                list[i].females += females;
                return;
            }
        }
        var obj;
        obj = { "id": id, "name": name, "category": cat, "cnt": 1, "males": males, "females": females };
        list.push(obj);
    }
    /*
    this.CalculatePct = function(list) {
        var total = 0;

        for (var h = 0; h < list.length; h++) {
            total = (list[h].sex.toLowerCase() === "total") ? total + list[h].cnt : total + 0;
        }

        for (var h = 0; h < list.length; h++) {
            list[h].pct = Math.round(list[h].cnt / total * 100);
        }
    }
    */
    this.thousandSeparator = function (n, sep) {
        var sRegExp = new RegExp('(-?[0-9]+)([0-9]{3})'),
        sValue = n + '';
        if (sep === undefined) { sep = ','; }
        while (sRegExp.test(sValue)) {
            sValue = sValue.replace(sRegExp, '$1' + sep + '$2');
        }
        return sValue;
    };

    this.removeSmallLikes = function(list) {
        var categories = [];
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            if (obj.cnt >= 5)
                categories.push(obj);
        }
        return categories;
    }
    /*
    // LikeType can be all, weekly, monthly;
    this.getUsersWithMostLikes = function (likeType) {
        var cumulative = 0;
        if (likeType === 'all') {
            var sums = _.map(this.topLikers, function (obj) { cumulative += obj.likescount });
            var sorted = _.sortBy(this.topLikers, function (obj) { return -obj.likescount; });
            var ret = _.map(sorted, function (obj) { obj.likespct = Math.round((obj.likescount / cumulative) * 100) });
        }
        else if (likeType === 'weekly') {
            var sums = _.map(this.topLikers, function (obj) { cumulative += obj.likescountweek });
            var sorted = _.sortBy(this.topLikers, function (obj) { return -obj.likescountweek; });
            var ret = _.map(sorted, function (obj) { obj.likespct = Math.round((obj.likescountweek / cumulative) * 100) });
        }
        if (likeType === 'monthly') {
            var sums = _.map(this.topLikers, function (obj) { cumulative += obj.likescountmonth });
            var sorted = _.sortBy(this.topLikers, function (obj) { return -obj.likescountmonth; });
            var ret = _.map(sorted, function (obj) { obj.likespct = Math.round((obj.likescountmonth / cumulative) * 100) });
        }
        return sorted;
    }

    this.getUserLikes = function (id) {
        return _.find(this.userCollection, function(user) { return user.id == id });
    }

    this.getTopLikes = function (sex) {
        var start = new Date().getTime();
        var topLikes = [];
        var sortedLikes = [];
        var males = 0;
        var females = 0;
        _.each(this.userCollection, function (user) {
            if (user.sex != undefined) {
                males = (user.sex.toLowerCase() === "male") ? 1 : 0;
                females = (user.sex.toLowerCase() === "female") ? 1 : 0;
            }
            _.each(user.likes, function (likes) {
               fb.insertlike(topLikes, likes.name, likes.id, "", males, females);
            });
        });

        if (sex === undefined)
            sortedLikes = _.sortBy(topLikes, function (obj) { return -obj.cnt; });
        else if (sex === 'male')
            sortedLikes = _.sortBy(topLikes, function (obj) { return -obj.males; });
        else if(sex === 'female')
            sortedLikes = _.sortBy(topLikes, function (obj) { return -obj.females; });
        console.log(sortedLikes.length);
        var end = new Date().getTime();
        console.log('getTopLikes Execution time: ' + (end - start) / 1000 + ' sek')
        return sortedLikes.slice(0, 10);
    }
    */
    this.parseFacebookDate = function(facebookDate) {
        //yyyy-mm-ddThh:mm:ss+0000
        var dateArray = facebookDate.split('-');
        var year = dateArray[0];
        var month = dateArray[1] - 1; 
        var partialDate = dateArray[2];
        //ddThh:mm:ss+0000
        dateArray = partialDate.split('T');
        var day = dateArray[0];
        var time = dateArray[1].slice(1); //Remove the 'T' in the timestamp
        //hh:mm:ss+0000
        var timeArray = time.split(':');
        var hours = timeArray[0];
        var minutes = timeArray[1];
        //ss+0000
        var seconds = timeArray[2].split('+', 1);
        return new Date(fb.monthName(month) + " " + day + ", " + year + " " + hours + ":" + minutes + ":" + seconds).getTime();
    }

    this.monthName = function(i) {
        var month = new Array(11);
        month[0] = "Jan";
        month[1] = "Feb";
        month[2] = "Mar";
        month[3] = "Apr";
        month[4] = "May";
        month[5] = "Jun";
        month[6] = "Jul";
        month[7] = "Aug";
        month[8] = "Sep";
        month[9] = "Oct";
        month[10] = "Nov";
        month[11] = "Dec";
        return month[i];
    }

    this.getRankingString = function (num) {
        var str;
        var ist = "st";
        var sec = "nd";
        var thr = "rd";
        var top = "th";
        if (num > 3) return top;
        if (num == 1) return ist;
        if (num == 2) return sec;
        if (num == 3) return thr;
    }

    this.getShortListWithUser = function (list, cnt, user) {
        var arr = [];
        var match = false;
        for (var i = 0; i < cnt; i++) {
            arr.push(list[i]);
            if (arr[i].name === user.name) match = true;
        };
        if (!match && user != undefined) {
            arr.pop();
            arr.push(user);
        }
        return arr;
    }

    this.sortNumber = function (a, b) {
        return b.likescount - a.likescount;
    }
    this.sortByNum = function (a, b) {
        return b.cnt - a.cnt;
    }
    this.sortByVal = function (list) {
        if (list.length === 1) return list;
        list.sort(function (b, a) {
            return a.cnt - b.cnt;
        })
    }
     this.initialize();
}