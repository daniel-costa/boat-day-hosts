define([
'views/BaseView',
'text!templates/HelpCenterTemplate.html'
], function(BaseView, HelpCenterTemplate){
	var HelpCenterView = BaseView.extend({

		className:"view-help-center",

		template: _.template(HelpCenterTemplate),

		events: {
			"submit form" : "sendReport"
		}, 

		sendReport: function(event) {

			event.preventDefault();

			var self = this;
			self.buttonLoader('Saving');
			self.cleanForm();

			var data = {
				category: this._in('reportType').val(),
				feedback: this._in('feedback').val(), 
				user: Parse.User.current()
			};

			var reportSubmitSuccess = function() {

				self._info('Thank you for your feedback. We will answer by email asap');
				Parse.history.navigate("dashboard", true);

			};

			var saveError = function(error) {

				self.buttonLoader();

				if( error.type && error.type == 'model-validation' ) {

					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});

				} else {

					console.log(error);
					self._error(error);

				}

			};

			this.model.save(data).then(reportSubmitSuccess, saveError);
		}

	});
	
	return HelpCenterView;

});