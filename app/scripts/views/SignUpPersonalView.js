define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/SignUpPersonalTemplate.html'
], function($, _, Parse, BaseView, SignUpPersonalTemplate){
	var SignUpPersonalView = BaseView.extend({

		template: _.template(SignUpPersonalTemplate),

	});
	return SignUpPersonalView;
});
