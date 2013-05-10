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

fb.views.Welcome = Backbone.View.extend({

    initialize: function () {
        var self = this;
        this.template = fb.templateLoader.get('welcome');
        this.render();
    },

    render: function () {
        this.$el.html(this.options.template(this.model));
        console.log("ss " + this.model)
        if (this.model != undefined) this.drawDonut();
        return this;
    },
    drawDonut: function () {
        var obj = {
            segmentShowStroke: false,
            segmentStrokeColor: "#fff",
            segmentStrokeWidth: 2,
            percentageInnerCutout: 40,
            animation: true,
            animationSteps: 50,
            animationEasing: "easeOutQuad",
            animateRotate: true,
            animateScale: false,
        }
        //this.model.donutObj
        var myDoughnut = new Chart(document.getElementById("mycanvas").getContext("2d")).Doughnut(this.model.donutObj, obj);
    },

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