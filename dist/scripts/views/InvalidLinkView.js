define([
'views/BaseView',
'text!templates/InvalidLinkTemplate.html'
], function(BaseView, InvalidLinkTemplate){
	var InvalidLinkView = BaseView.extend({

		className: "view-invalid-link container",

		template: _.template(InvalidLinkTemplate),

		theme: "guest",

	});
	return InvalidLinkView;
});
