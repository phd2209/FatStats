fb.views.Login = Backbone.View.extend({

    initialize: function () {
        var self = this;
        this.template = fb.templateLoader.get('login');
        this.render();
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    events: {
        'click .login': 'login'
    },

    login: function () {
        $(document).trigger('login');
        console.log("login");
        return false;
    }

});
fb.views.Menu = Backbone.View.extend({

    initialize: function () {
        var self = this;
        this.template = fb.templateLoader.get('menu');
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    },

});
fb.views.Person = Backbone.View.extend({

    initialize: function () {
        var self = this;
        this.template = fb.templateLoader.get('person');
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    },
});

fb.views.Welcome = Backbone.View.extend({

    initialize: function () {
        var self = this;
        this.template = fb.templateLoader.get('welcome');
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    }
});

fb.views.Like = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    }

});


fb.views.Category = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    }

});

fb.views.Categories = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    }

});

fb.views.Toplikers = Backbone.View.extend({

    events: {
        'click #all': 'getAll',
        'click #week': 'getWeekly',
        'click #month': 'getMonthly'
    },

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    },

    getAll: function () {
        this.$('.num-likes-month').hide();
        $('.num-likes-week').hide();
        $('.num-likes-month').hide();
        this.model = DataService.getTopLikersCollection(fb.userCollection,'ALL');
        this.render();
        return false;
    },
    getWeekly: function () {
        $('.num-likes').hide();
        this.$('.num-likes-month').hide();
        console.log("WEEK");
        this.model = DataService.getTopLikersCollection(fb.userCollection, 'WEEK');
        this.render();
        return false;
    },
    getMonthly: function () {
        console.log("MONTH");
        $('.num-likes-week').hide();
        this.$('.num-likes').hide();
        this.model = DataService.getTopLikersCollection(fb.userCollection, 'MONTH');
        this.render();
        return false;
    }

});

fb.views.Toplikes = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    }

});

fb.views.TopPhotos = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        return this;
    }

});

fb.views.Error = Backbone.View.extend({

    initialize: function () {
        this.template = _.template(fb.templateLoader.get('error'));
        this.render();
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    events: {
        'click .retry': 'retry'
    },

    retry: function () {
        Backbone.history.loadUrl(Backbone.history.fragment);
    }

});