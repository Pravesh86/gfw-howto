(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.AsideView = Backbone.View.extend({

    el: '#asideView',

    events: {
      'click .js-toggle-list' : 'toggleSubmenu'
    },

    model: new (Backbone.Model.extend({
    })),

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      this.listeners();
      this.cache();

      // inits
      this.highlight();
    },

    cache: function() {
      // model vars
      this.model.set(this.options.model);
    },

    listeners: function() {
    },

    highlight: function() {
      if (!!this.model.get('id')) {
        var $el = this.$el.find('#aside-'+this.model.get('id'));
        $el.addClass('-active');
      }
    },

    toggleSubmenu: function(e) {
      e && e.preventDefault();
      var submenuId = $(e.currentTarget).data('submenu');
      var $submenu = $('#'+submenuId);

      $(e.currentTarget).toggleClass('-collapsed');
      $submenu.toggleClass('-collapsed');
    },

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.BlogView = Backbone.View.extend({

    el: '#blogView',

    template: HandlebarsTemplates['blog'],

    model: new (Backbone.Model.extend({
      url: 'https://gfw-huggin.herokuapp.com/users/1/web_requests/21/blogrss.json',
    })),

    events: {

    },

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      this.options.sample = ($(window).width() < 850) ? 1 : 2;


      this.cache();

      this.model.fetch().success(function(data){
        this.render();
      }.bind(this));
    },

    cache: function() {
    },

    render: function() {
      this.$el.html(this.template({ blogposts: this.parse() }))
    },

    parse: function() {
      var groups = _.groupBy(_.map(this.model.get('items'), function(item){
        item.categories = (!!item.categories) ? this.slugify(item.categories) : 'default';
        return item;
      }.bind(this)), 'categories');

      var items = _.map(_.sample(groups,this.options.sample), function(group){
        return _.sample(group);
      });

      return items;
    },

    slugify: function(text) {
      return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    },

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.BlogListView = Backbone.View.extend({

    el: '#blogListView',

    template: HandlebarsTemplates['blogList'],

    model: new (Backbone.Model.extend({
      url: 'https://gfw-huggin.herokuapp.com/users/1/web_requests/21/blogrss.json',
    })),

    events: {

    },

    initialize: function(settings) {
      if (! !!this.$el.length) {
        return;
      }

      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);


      this.cache();

      this.model.fetch().success(function(data){
        this.render();
      }.bind(this));
    },

    cache: function() {
    },

    render: function() {
      this.$el.html(this.template({ blogposts: this.parse() }))
    },

    parse: function() {
      // console.log(this.model.get('items'));
      return _.map(this.model.get('items'), function(item){
        item.categorySlug = this.slugify(item.categories);
        return item;
      }.bind(this));
    },

    slugify: function(text) {
      return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    },

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.ContentView = Backbone.View.extend({

    el: '#contentView',

    model: new (Backbone.Model.extend({
      defaults: {
        filters: []
      }
    })),

    initialize: function(settings) {
      if (! !!this.$el.length) {
        return;
      }
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      this.listeners();
      this.cache();
    },

    cache: function() {
      this.$cards = this.$el.find('.m-content-item');
    },

    listeners: function() {
      this.model.on('change:filters', this.filter.bind(this));

      Backbone.Events.on('Filters/change', function(filters){
        this.model.set('filters', _.clone(filters));
      }.bind(this));
    },

    filter: function() {
      var filters = this.model.get('filters');

      if (!!filters.length) {
        _.each(this.$cards, function(card){
          var visible = _.intersection(filters, $(card).data('tags').split(' ')); 
          $(card).toggleClass('-invisible', ! !!visible.length);
        }.bind(this));
      } else {
        this.$cards.toggleClass('-invisible', false);
      }
    }

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.FaqsView = Backbone.View.extend({

    el: '#faqsView',

    template: HandlebarsTemplates['faqs'],

    events: {
      'click .toggle' : 'onClickFaq'
    },

    model: new (Backbone.Model.extend({
      defaults: {
        page: null,
        filters: [],
        pagination: true,
        itemsOnPage: 12
      }
    })),

    collection: new (Backbone.Collection.extend({

      url: baseurl + '/json/faqs.json',

      // Me may use a comparator function,
      // we will prevent sort each time our results
      parse: function(response){
        var response = _.map(response, function(el){

          el.tags = (!!el.tags && !!el.tags.length) ? el.tags.split(', ') : [];

          el.tags_slugs = _.map(el.tags, function(_tag){
            return _tag.replace(/_/g, '-')
          })

          el.tags_info = _.map(el.tags, function(_tag){
            var tag = window.gfw_howto.tags[_tag];
            tag.url = baseurl + '/tags/' + tag.slug + '/';
            return tag;
          })

          el.slug = this.slugify(el.title);

          return el;
        }.bind(this));

        return response;
      },

      getFaqs: function(params) {
        this.filters = params.filters;
        this.itemsOnPage = params.itemsOnPage;
        if(!!this.filters && !!this.filters.length) {
          // If a filter exists
          this.collection = _.sortBy(_.filter(this.toJSON(), function(el){
            var is_selected = _.intersection(this.filters,el.tags_slugs);
            return !!is_selected.length;
          }.bind(this)), 'order');

          return params.pagination
            ? this.collection.slice(params.page*this.itemsOnPage, (params.page*this.itemsOnPage) + this.itemsOnPage)
            : this.collection;

        } else {
          // If a filter doesn't exist
          this.collection = this.toJSON();
          return params.pagination
            ? this.collection.slice(params.page*this.itemsOnPage, (params.page*this.itemsOnPage) + this.itemsOnPage)
            : this.collection;
        }
      },

      getCount: function() {
        if (!!this.filters && !!this.filters.length) {
          this.collection = _.filter(this.toJSON(), function(el){
            var is_selected = _.intersection(this.filters,el.tags_slugs);
            return !!is_selected.length;
          }.bind(this));

          return this.collection.length

        } else {
          return this.toJSON().length;
        }
      },

      getPageFromSlug: function(filters,slug,itemsOnPage) {
        if(!!this.filters && !!this.filters.length) {
          // If a filter exists
          this.collection = _.filter(this.toJSON(), function(el){
            var is_selected = _.intersection(this.filters,el.tags_slugs);
            return !!is_selected.length;
          }.bind(this));
        } else {
          // If a filter doesn't exist
          this.collection = this.toJSON();
        }

        var index = _.findIndex(this.collection, {slug: slug});
        if (index >= 0) {
          return Math.floor(index/itemsOnPage);
        }
        return 0;
      },

      /**
       * HELPERS
       * slugify
       * @param  {[string]} text
       * @return {[string]} text
       */
      slugify: function(text) {
        return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-');        // Replace multiple - with single -
      },


    })),

    initialize: function(settings) {
      if (! !!this.$el.length) {
        return;
      }
      var opts = settings && settings.options ? settings.options : {};
      var params = settings && settings.params ? settings.params : {};
      this.options = _.extend({}, this.defaults, opts);
      this.model.set(params);
      this.listeners();
      this.collection.fetch().done(function() {
        this.render()
      }.bind(this));
    },

    listeners: function() {
      // Model listeners
      this.model.on('change:filters', function(){
        this.model.set('slug', null);
        this.model.set('page', 0);
        this.render();
      }.bind(this));

      this.model.on('change:slug', function(){
        this.render();
        Backbone.Events.trigger('Route/update', 'slug', this.model.get('slug'));
      }.bind(this));

      // Backbone listeners
      Backbone.Events.on('Route/go',this.routerGo.bind(this));
      Backbone.Events.on('Filters/change', function(filters){
        this.model.set('filters', _.clone(filters));
      }.bind(this));
    },

    cache: function() {
      this.$htmlbody = $('html,body');
      this.$listItems = this.$el.find('.m-faqs-list');
      this.$paginationContainer = this.$el.find('.m-faqs-pagination');
    },

    render: function() {
      this.model.set('page', this.getPage());
      this.$el.html(this.template({
        baseurl: window.gfw_howto.baseurl,
        list: this.collection.getFaqs(this.model.attributes),
        pagination: this.model.attributes.pagination
      }));
      this.cache();

      if (this.model.get('pagination')) {
        this.initPaginate();
      }
      this.toggleFaq();
    },

    initPaginate: function(){
      // pagination
      if (this.collection.getCount() > this.model.get('itemsOnPage')) {
        this.$paginationContainer.pagination({
          items: this.collection.getCount(),
          itemsOnPage: this.model.get('itemsOnPage'),
          currentPage: this.model.get('page') + 1,
          displayedPages: 3,
          selectOnClick: false,
          prevText: ' ',
          nextText: ' ',
          onPageClick: _.bind(function(page, e){
            e && e.preventDefault();
            this.model.set('slug', null);
            this.model.set('page', page - 1);
            this.render()
            this.$paginationContainer.pagination('drawPage', page);
            this.$htmlbody.animate({
              scrollTop: 0,
            },250);

          }, this )
        });
      }
      Backbone.Events.trigger('Route/update', 'page', this.model.get('page'));
    },

    // Events
    onClickFaq: function(e) {
      var is_link = !!$(e.target).closest('a').length;
      var $parent = $(e.currentTarget).parent();
      if (!is_link) {
        if ($parent.hasClass('-selected')) {
          this.model.set('slug', null);
        } else {
          this.model.set('slug', $parent.data('slug'));
        }
      }
    },

    toggleFaq: function() {
      var slug = this.model.get('slug');
      if (!!slug) {
        var $current = this.$listItems.children('li[data-slug="'+slug+'"]');
        this.$listItems.children('li').removeClass('-selected');
        $current.addClass('-selected');

        this.$htmlbody.animate({
          scrollTop: (!!$current) ? $current.offset().top : 0,
        },250);
      }
    },

    getPage: function() {
      if (!!this.model.get('slug') && !this.model.get('page')) {
        return this.collection.getPageFromSlug(this.model.get('filters'), this.model.get('slug'), this.model.get('itemsOnPage'));
      }
      return this.model.get('page') || 0;
    },


    // ROUTER GO
    routerGo: function(params) {
      if (!!params) {
        this.model.set({
          slug: params.slug,
          page: params.page
        }, { silent: true });
      }
    },


  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.FaqsSelectView = Backbone.View.extend({

    el: '#faqsSelectView',

    events: {
      'change select' : 'filterByApp'
    },

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      this.$select = this.$el.find('select');
      this.initChosen();
    },

    initChosen: function() {
      this.$select.chosen({
        disable_search: true
      });
    },

    filterByApp: function(e) {
      var value = $(e.currentTarget).val();
      Backbone.Events.trigger('faqs/filter', value);
    }

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.FiltersView = Backbone.View.extend({

    el: '#filtersView',

    events: {
      'change .js-checkbox-tag' : 'setFilters'
    },

    model: new (Backbone.Model.extend({
      defaults: {
        filters: []
      }
    })),

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      this.listeners();
      this.cache();
    },

    cache: function() {
      // model vars
      this.model.set(this.options.model);
      this.$checkbox = this.$el.find('[name="checkbox-tag"]');
    },

    listeners: function() {
      Backbone.Events.on('Route/go',this.routerGo.bind(this));
      this.model.on('change:filters', this.publishFilters.bind(this));
    },
 
    /**
     * UI EVENTS
     */
    setFilters: function(e) {
      var filters = _.compact(_.map(this.$checkbox, function(el){
        var checked = $(el).is(':checked');
        if (checked) {
          return $(el).data('tag')
        }
      }.bind(this)));
      this.model.set('filters', _.clone(filters));
    },

    updateFilterCheckboxes: function() {
      var filters = this.model.get('filters');
      _.each(this.$checkbox, function(el){
        var tag = $(el).data('tag');
        var is_checked = _.contains(filters, tag);
        $(el).prop( "checked", is_checked);
      })
    },

    /**
     * STATE EVENTS
     */
    routerGo: function(params) {
      if (!!params && !!params.filters) {
        var filters = JSON.parse(params.filters);
        this.model.set('filters', _.clone(filters));
        this.updateFilterCheckboxes();
      }
    },

    publishFilters: function() {
      Backbone.Events.trigger('Filters/change', this.model.get('filters'));
      Backbone.Events.trigger('Route/update', 'filters', this.model.get('filters'));
    },

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.GoogleGroupView = Backbone.View.extend({

    el: '#googleGroupsView',

    template: HandlebarsTemplates['googlegroups'],

    model: new (Backbone.Model.extend({
      url: 'https://gfw-huggin.herokuapp.com/users/1/web_requests/22/googlegroupsrss.json',
    })),

    events: {

    },

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      this.options.sample = ($(window).width() < 850) ? 1 : 2;


      this.cache();

      this.model.fetch().success(function(data){
        this.render();
      }.bind(this));
    },

    cache: function() {
    },

    render: function() {
      this.$el.html(this.template({ discussions: this.parse() }))
    },

    parse: function() {
      return this.model.get('items');
    },

    slugify: function(text) {
      return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    },

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Collection = root.app.Collection || {};

  // Model for getting the data
  root.app.Collection.SearchCollection = Backbone.Collection.extend({
    url: baseurl + '/json/search.json',
    parse: function(response) {
      // Remove the categories that you don't want to search in
      return _.compact(_.map(response, function(item) {
        return (item.category != 'blogs') ? item : null;
      }))
    }
  });

  // View for display results
  root.app.View.SearchView = Backbone.View.extend({

    events: {
      'focus #search-input' : 'search',
      'keyup #search-input' : 'search',
      'click #search-close' : 'removeResults',
      'click .js-result-link' : 'clickResult'
    },

    resultsTemplate: HandlebarsTemplates['search'],

    initialize: function(settings) {      
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);
      
      // Check if it's home page
      if(!!this.options.is_home) {
        this.$el.parents('.m-aside').hide();
        return;
      };

      this.collection = new root.app.Collection.SearchCollection();
      this.collection.fetch().done(function(){
        this.cache();
        this.initFuse();
      }.bind(this));
    },

    cache: function() {
      this.searchIndex = 0;
      this.$searchInput = this.$el.find('#search-input');
      this.$searchClose = this.$el.find('#search-close');
      this.$searchResults = this.$el.find('#search-results');

    },

    initFuse: function() {
      var json = this.collection.toJSON();
      this.fuse = new Fuse(json, {
        caseSensitive: false,
        includeScore: false,
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        keys: ['title','content','category','tags']
      });
    },


    search: function(e) {
      var val = $(e.currentTarget).val();
      switch(e.keyCode) {
        case 13:
          this.selectResult();
        break;
        case 27:
          this.removeResults();
        break;
        case 38:
          this.indexResults('up');
        break;
        case 40:
          this.indexResults('down');
        break;
        default:
          (!!val) ? this.setResults(val) : this.removeResults();
          this.highlightResults();
      }
    },

    indexResults: function(direction) {
      if (!!this.resultsLength) {
        switch(direction) {
          case 'up':
            (this.searchIndex != 0) ? this.searchIndex-- : this.searchIndex = 0;
          break;
          case 'down':
            (this.searchIndex < this.resultsLength - 1) ? this.searchIndex++ : this.searchIndex = this.resultsLength - 1;
          break;
        }
      }
      this.highlightResults();
    },

    highlightResults: function() {
      this.$searchResults.children('li').removeClass('-highlight');
      this.$searchResults.children('li').eq(this.searchIndex).addClass('-highlight');
    },

    selectResult: function() {
      var $link = this.$searchResults.children('li').eq(this.searchIndex).children('a')
      if ($link.data('category') == 'faqs') {
        window.location = baseurl + '/categories/faqs/?slug=' + $link.data('slug');
      } else {
        window.location = $link.attr('href');
      }
    },

    clickResult: function(e) {
      if ($(e.currentTarget).data('category') == 'faqs') {
        e && e.preventDefault();  
        window.location = baseurl + '/categories/faqs/?slug=' + $(e.currentTarget).data('slug');        
      }
    },

    setResults: function(val) {
      this.results = this.parseResults(val);
      this.resultsLength = this.results.length + _.flatten(_.pluck(_.flatten(this.results), 'posts')).length;
      
      this.$searchResults.addClass('-active').html(this.resultsTemplate({ 
        results: (!!this.resultsLength) ? this.results.slice(0,4) : null 
      }));
      // svg addClass
      this.$searchClose.addClass('-active');
    },

    parseResults: function(val) {
      return _.map(_.groupBy(this.fuse.search(val), 'category'), function(group, key){
        var key_slugify = key.replace(/\s/g, '_');

        if (!!key_slugify) {
          var category_info = window.gfw_howto.categories[key_slugify];
          category_info.slug = this.slugify(category_info.slug);
          category_info.url = window.gfw_howto.baseurl + /categories/ + category_info.slug;

          return {
            category_info: category_info,
            posts: _.map(_.first(group,5), function(post){
              post.slug = this.slugify(post.title);
              post.category_info = category_info;
              return post;
            }.bind(this)),
          } 
        }

      }.bind(this));
    },

    removeResults: function() {
      this.searchIndex = 0;
      this.results = this.fuse.search('');
      this.$searchInput.val('');
      this.$searchResults.removeClass('-active').html(this.resultsTemplate({ results: []}));
      // svg removeClass
      this.$searchClose.removeClass('-active');
    },

    /**
     * HELPERS
     * slugify 
     * @param  {[string]} text
     * @return {[string]} text
     */
    slugify: function(text) {
      return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    },


  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};

  root.app.View.SliderView = Backbone.View.extend({

    el: '#sliderView',

    events: {
      'click .js_slide_navigation li' : 'clickNavigation'
    }, 

    navTemplate: HandlebarsTemplates['slider'],

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);

      enquire.register("screen and (min-width: 850px)", {
        match: function(){
          this.mobile = false;
          this.initSlider();
        }.bind(this)
      });
      enquire.register("screen and (max-width: 850px)", {
        match: function(){
          this.mobile = true;
          this.initSlider();
        }.bind(this)
      });
    },

    initSlider: function() {
      this.options.slider = this.setOptions();
      this.initNavigation();
      this.initLory();
    },

    cache: function() {
      this.$slider = this.$el.find('.js_slider');
      this.$sliderItems = this.$el.find('.js_slide');
      this.slideCount = this.$el.find('.js_slide').length;

      this.$sliderNavigation = this.$el.find('.js_slide_navigation');
    },

    // Slider plugin
    initLory: function() {
      // init slider
      if (!!this.slider) {
        this.slider.reset();
        this.slider.destroy();
      }

      // set width of each element
      this.$slider[0].addEventListener('before.lory.init', this.setSlideWidth.bind(this));
      this.$slider[0].addEventListener('on.lory.resize', this.setSlideWidth.bind(this));
      this.$slider[0].addEventListener('after.lory.init', this.setNavigation.bind(this));
      this.$slider[0].addEventListener('after.lory.slide', this.setNavigation.bind(this));

      this.slider = window.lory.lory(this.$slider[0], this.options.slider);
    },

    setOptions: function() {
      this.cache();
      return {
        slidesToScroll: (!!this.mobile) ? 1 : 2,
        infinite: (!!this.mobile) ? 1 : 2,
        slides_per_slide: (!!this.mobile) ? 1 : 2
      }
    },

    setSlideWidth: function() {
      var width = this.$slider.width()/this.options.slider.slides_per_slide;
      this.$sliderItems.width(width);
    },

    initNavigation: function() {
      var pages = Math.ceil(this.slideCount/this.options.slider.slides_per_slide);
      var arrayPages =(function(a,b){while(a--)b[a]=a+1;return b})(pages,[]);

      this.$sliderNavigation.html(this.navTemplate({pages: arrayPages}));
      this.$sliderNavigationItems = this.$sliderNavigation.find('li');
    },

    // Events
    clickNavigation: function(e) {
      e && e.preventDefault();
      var index = $(e.currentTarget).data('index');
      var direction = $(e.currentTarget).data('direction');
      if (index != undefined) {
        this.slider.slideTo(index*this.options.slider.slides_per_slide)
      } else {
        switch (direction) {
          case 'left':
            this.slider.prev();
          break;
          case 'right':
            this.slider.next();
          break;
        }
      }
    },

    // Events
    setNavigation: function(e) {
      e && e.preventDefault();
      var current = 0;
      if (this.slider) {
        current = Math.ceil(this.slider.returnIndex()/2);
      }
      // Set current
      this.$sliderNavigationItems.removeClass('-active');
      this.$sliderNavigation.find('li[data-index='+current+']').addClass('-active');
    }

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Model = root.app.Model || {};

  // View for display results
  root.app.View.ToggleView = Backbone.View.extend({

    el: '#toggleView',

    model: new (Backbone.Model.extend({
      defaults: {
        toggle: 'desktop'
      }
    })),

    events: {
      'click .choice' : 'toggle'
    },

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);

      this.cache();
      this.listeners();
      this.changeToggle();
    },

    cache: function() {
      this.$desktopContent = $('#desktopContent');
      this.$mobileContent = $('#mobileContent');

      this.$buttons = this.$el.find('.choice');
      this.$skitter = this.$el.find('.skitter');
    },

    listeners: function() {
      this.model.on('change:toggle', this.changeToggle.bind(this));
    },

    toggle: function(e) {
      e && e.preventDefault();

      this.$buttons.removeClass('-active');
      $(e.currentTarget).addClass('-active');

      this.model.set('toggle',$(e.currentTarget).data('toggle'));
    },

    changeToggle: function() {
      var toggle = this.model.get('toggle');
      switch(toggle) {
        case 'desktop':
          this.$desktopContent.show(0);
          this.$mobileContent.hide(0);
          this.$skitter.css({ left: '0%' });
          ga('send', 'event', 'How to', 'Change Mode', 'Change to desktop’');
        break;
        case 'mobile':
          this.$desktopContent.hide(0);
          this.$mobileContent.show(0);
          this.$skitter.css({ left: '50%' });
          ga('send', 'event', 'How to', 'Change Mode', 'Change to mobile');
        break;
      }
    }

  });

})(this);

(function(root) {

  'use strict';

  root.app = root.app || {};

  root.app.Router = Backbone.Router.extend({

    routes: {
      // HOME
      '': 'home',
      // APP
      'categories/:id(/)': 'category',
      //THEME
      'tags/:id(/)': 'tag'
    },

    ParamsModel: Backbone.Model.extend({}),

    initialize: function(settings) {
      var opts = settings && settings.options ? settings.options : {};
      this.options = _.extend({}, this.defaults, opts);

      this.params = new this.ParamsModel(); // This object save the URL params
      this.updateParams();
      this.listeners();
    },

    listeners: function() {
      Backbone.Events.on('Route/update', function(name,value){
        this.setParams(name,value);
        this.updateUrl();
      }.bind(this));
    },
    
    /**
     * Get params
     */
    getParams: function() {
      var params = this.params.toJSON();
      return (_.isEmpty(params)) ? this.updateParams() : params;
    },

    /**
     * Set params and update model
     * @param {String} name
     * @param {String|Object|Array} value
     * @param {Array[String]} keys
     */
    setParams: function(name, value, keys) {
      if (typeof value === 'string' || typeof value === 'number') {
        this.params.set(name, value);
      } else if (typeof value === 'object' && !_.isArray(value)) {
        if (keys && _.isArray(keys)) {
          // var params = _.pick(value, 'id', 'opacity', 'order');
          // this.params.set(name, JSON.stringify(params));
        } else {
          if (!!value) {
            this.params.set(name, JSON.stringify(value));  
          } else {
            this.params.unset(name, { silent: true });
          }
          
        }
      } else if (typeof value === 'object' && _.isArray(value)) {
        if (keys && _.isArray(keys)) {
          var params = _.map(value, function(v) {
            return _.pick(v, keys);
          });
          this.params.set(name, JSON.stringify(params));
        } else {
          this.params.set(name, JSON.stringify(value));
        }
      }
    },

    /**
     * Change url with params
     */
    updateUrl: function() {
      var href = (!!baseurl) ? location.pathname.replace(baseurl,'') : location.pathname;
      var url = href + '?' + this._serializeParams();
      this.navigate(url, { trigger: false });
    },

    /**
     * This method will update this.params object when URL change
     * @param  {String} routeName
     * @param  {Array} params
     */
    updateParams: function() {
      var p = this._unserializeParams();
      this.params.clear({ silent: true }).set(p);
    },

    /**
     * Transform URL string params to object
     * @return {Object}
     */
    _unserializeParams: function() {
      var params = {};
      if (location.search.length) {
        var paramsArr = decodeURIComponent(location.search.slice(1)).split('&'),
          temp = [];
        for (var p = paramsArr.length; p--;) {
          temp = paramsArr[p].split('=');
          if (temp[1] && !_.isNaN(Number(temp[1]))) {
            params[temp[0]] = Number(temp[1]);
          } else if (temp[1]) {
            params[temp[0]] = temp[1];
          }
        }
      }
      return params;
    },

    /**
     * Transform object params to URL string
     * @return {String}
     */
    _serializeParams: function() {
      return this.params ? decodeURIComponent($.param(this.params.attributes)) : null;
    }

  });

})(this);

(function(root) {

  'use strict';

  /**
   * Provide top-level namespaces for our javascript.
   * @type {Object}
   */
  root.app = root.app || {
    Model: {},
    Collection: {},
    View: {},
    Helper: {}
  };

  /**
   * Main Application View
   */
  root.app.AppView = Backbone.View.extend({

    /**
     * Main DOM element
     * @type {Object}
     */
    el: document.body,

    initialize: function() {
      this.router = new root.app.Router();
      this.setListeners();
    },

    setListeners: function() {
      this.listenTo(this.router, 'route:home', this.homePage);
      this.listenTo(this.router, 'route:category', this.categoryPage);
      this.listenTo(this.router, 'route:tag', this.tagPage);
    },

    start: function() {
      Backbone.history.start({
        pushState: true,
        root: (!!baseurl) ? baseurl : "/"
      });
      this.setGlobalViews();
      Backbone.Events.trigger('Route/go', this.router.getParams())

    },

    homePage: function() {
      this.asideView = new root.app.View.AsideView({ options: { model: { id: null }}});
      this.searchView = new root.app.View.SearchView({
        el: '#searchView'
      });
      this.googleGroupView = new root.app.View.GoogleGroupView();
    },

    categoryPage: function(id, params) {
      this.filtersView = new root.app.View.FiltersView({});
      this.faqsView = new root.app.View.FaqsView();
      this.contentView = new root.app.View.ContentView({});
      this.blogListView = new root.app.View.BlogListView();
      this.asideView = new root.app.View.AsideView({
        options: {
          model: {
            id: id
          }
        }
      });
    },

    tagPage: function(id) {
      this.asideView = new root.app.View.AsideView({});
      this.faqsView = new root.app.View.FaqsView({
        params: {
          pagination: false,
          filters: [id]
        }
      });
    },

    setGlobalViews: function() {
      this.blogView = new root.app.View.BlogView();
      this.toggleView = new root.app.View.ToggleView();

      this.searchAsideView = new root.app.View.SearchView({
        el: '#searchAsideView',
        options: {
          is_home: (this.router.routes[Backbone.history.getFragment()] == 'home')
        }
      });
    }

  });

  new app.AppView().start();

})(this);
