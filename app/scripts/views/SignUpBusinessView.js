define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/SignUpBusinessTemplate.html'
], function($, _, Parse, BaseView, SignUpBusinessTemplate){
	var SignUpBusinessView = BaseView.extend({

		template: _.template(SignUpBusinessTemplate),

	});
	return SignUpBusinessView;
});
