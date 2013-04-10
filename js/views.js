fb.views.Welcome = Backbone.View.extend({

    initialize: function () {
        var self = this;
        this.template = fb.templateLoader.get('welcome');
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