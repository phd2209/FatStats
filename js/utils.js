var MobileApp = function() {

    this.initialize = function () {
        this.fbid = 0;
        this.country = "";
        this.fetches = 0;
        this.models = {};
        this.views = {};
        this.userCollection = new Array();
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


    this.getWelcomeMessage = function() {

        var Welcome = function () {
            this.totalLikes = 0;
            this.usersWithLikes = 0;
            this.country = 0;
            this.genders = [];
            this.years = [];
        };
        var wel = new Welcome();
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
        console.log("totalLikes" + wel.totalLikes);
        console.log("usersWithLikes" + wel.usersWithLikes);
        console.log("genders" + wel.genders.toString());
        console.log("countries" + wel.country);
        console.log("years" + wel.years.toString());
        return wel;
    }


    this.getCategories = function() {

        var categories = [];

        for (var j = 0; j < this.userCollection.length; j++) {
            var obj = this.userCollection[j];
            //totalLikes = totalLikes + obj.likescount;
            //insertLikeIndex(likeindex, userCollection[j].likescount, "Total");

            if (obj.likes != undefined | obj.likes == null) {
                //usersWithLikes = (obj.likes.length > 0) ? usersWithLikes + 1 : usersWithLikes + 0;
                for (var i = 0; i < obj.likes.length; i++) {

                    if (this.userCollection[j].likes[i].category.toLowerCase() != "community") {
                        this.userCollection[j].likes[i].link = this.userCollection[j].likes[i].category.replace(new RegExp("/", 'g'), "-");
                        this.insertCategory(categories, this.userCollection[j].likes[i].category);
                    }
                };
            }
        };

        this.sortByNum(categories);
        var selectedcats = categories.slice(0, Math.min(categories.length, 1000));
        return this.removeSmallLikes(selectedcats);
    }

    this.getLikes = function(cat) {
        //var sex;
        var number = 1000;
        var likes = [];

        for (var j = 0; j < this.userCollection.length; j++) {
            var obj = this.userCollection[j];

            //sex = obj.sex;
            for (var i = 0; i < obj.likes.length; i++) {

                if (this.userCollection[j].likes[i].link === decodeURIComponent(cat.trim())) {
                    this.insertlike(likes, this.userCollection[j].likes[i].name, this.userCollection[j].likes[i].id, cat);
                }
            };
        };

        this.sortByNum(likes);
        var selectedlikes = likes.slice(0, Math.min(likes.length, number));
        return selectedlikes;
    }

    this.insertCategory = function(list, cat) {
        //console.log("cat " + cat)
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

    this.insertlike = function(list, name, id, cat) {
        var obj;

        for (var i = 0; i < list.length; i++) {
            if (id === list[i].id) {
                list[i].cnt += 1;
                return;
            }
        }
        obj = { "id": id, "name": name, "category": cat, "cnt": 1 };
        list.push(obj);
    }

    this.CalculatePct = function(list) {
        var total = 0;

        for (var h = 0; h < list.length; h++) {
            total = (list[h].sex.toLowerCase() === "total") ? total + list[h].cnt : total + 0;
        }

        for (var h = 0; h < list.length; h++) {
            list[h].pct = Math.round(list[h].cnt / total * 100);
        }
    }

    this.sortByNum = function (list) {
        list.sort(function (b, a) {
            return a.cnt - b.cnt;
        })
    }

    this.removeSmallLikes = function(list) {
        var categories = [];
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            if (obj.cnt >= 5)
                categories.push(obj);
        }
        return categories;
    }

    this.initialize();
}