define([
'views/BaseView',
'models/HelpCenterModel',
'text!templates/HelpCenterTemplate.html'
], function(BaseView, HelpCenterModel, HelpCenterTemplate){
	var HelpCenterView = BaseView.extend({

		className:"view-help-center",

		template: _.template(HelpCenterTemplate),

		events: {
			
			"submit form" : "sendReport"
		}, 

		initialize: function() {

		}, 

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		sendReport: function(event) {

			event.preventDefault();
			var self = this;

			self.buttonLoader('Saving');
			self.cleanForm();

			var data = {
				status: "unread",
				category: this._in('reportType').val(),
				feedback: this._in('feedback').val(), 
			};

			var reportSubmitSuccess = function() {

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