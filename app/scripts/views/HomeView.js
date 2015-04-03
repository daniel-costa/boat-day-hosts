define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/HomeTemplate.html'
], function($, _, Parse, BaseView, HomeTemplate){
	var HomeView = BaseView.extend({

		template: _.template(HomeTemplate),

	});
	return HomeView;
});
