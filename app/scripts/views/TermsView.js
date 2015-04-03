define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/TermsTemplate.html'
], function($, _, Parse, BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		template: _.template(TermsTemplate),

	});
	return TermsView;
});
