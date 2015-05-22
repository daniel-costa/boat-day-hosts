define([
'views/BaseView',
'text!templates/InvalidLinkTemplate.html'
], function(BaseView, InvalidLinkTemplate){
	var InvalidLinkView = BaseView.extend({

		className: "view-home",

		template: _.template(InvalidLinkTemplate),

	});
	return InvalidLinkView;
});
