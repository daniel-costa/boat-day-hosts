define([
'views/BaseView',
'models/ReportModel',
'text!templates/ReportTemplate.html'
], function(BaseView, ReportModel, ReportTemplate){
	var ReportView = BaseView.extend({

		className:"view-report",

		template: _.template(ReportTemplate),

		events: {
			"submit form" : "sendFeedback",
		}, 
		
		theme: "account",

		sendFeedback: function(event) {

			event.preventDefault();

			var self = this;
			self.buttonLoader('Saving');
			self.cleanForm();

			new ReportModel().save({
				action: 'profile',
				user: Parse.User.current(),
				fromProfile: Parse.User.current().get('profile'),
				profile: this.model, 
				message: this._in('message').val()
			}).then(function() {
				Parse.history.navigate("dashboard", true);
				self._info('Thank you for contacting the BoatDay team, we will get back to you soon.');
			}, function(error) {
				self.handleSaveErrors(error);
			});
		}

	});
	
	return ReportView;

});