var MobileApp = function() {

    this.initialize = function () {
        this.fbid = "";
        this.lastUpdate = new Date();
        this.name = "";
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
    }


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

                    if (this.userCollection[j].likes[i].category.toLowerCase() != "community") {
                        this.userCollection[j].likes[i].link = this.userCollection[j].likes[i].category.replace(new RegExp("/", 'g'), "-");
                        this.insertCategory(categories, this.userCollection[j].likes[i].category, males, females);
                    }
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

    this.insertCategory = function(list, cat, males, females) {
        //console.log("cat " + cat)
        for (var i = 0; i < list.length; i++) {
            if (cat === list[i].category) {
                list[i].cnt += 1;
                list[i].males += males;
                list[i].females += females;
                return;
            }
        }

        var obj;
        var link = cat.replace(new RegExp("/", 'g'), "-");
        obj = { "category": cat, "link": link, "cnt": 1, "males": males, "females": females };
        list.push(obj);
    }

    this.insertlike = function(list, name, id, cat, males, females) {
        var obj;

        for (var i = 0; i < list.length; i++) {
            if (id === list[i].id) {
                list[i].cnt += 1;
                list[i].males += males;
                list[i].females += females;
                return;
            }
        }
        obj = { "id": id, "name": name, "category": cat, "cnt": 1, "males": males, "females": females };
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

    this.getUsersWithMostLikes = function () {
        var cumulative = 0;
        var sums = _.map(this.userCollection,function(obj){ cumulative += obj.likescount });
        var sorted = _.sortBy(this.userCollection, function(obj){ return -obj.likescount; });        
        return _.map(sorted, function (obj) { obj.likespct = Math.round((obj.likescount / cumulative) * 100) });
    }

    this.getUserLikes = function (id) {
        return _.find(this.userCollection, function(user) { return user.id == id });
    }

    this.initialize();
}