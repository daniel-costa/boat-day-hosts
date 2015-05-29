define([
'views/BaseView',
'text!templates/HelpCenterTemplate.html'
], function(BaseView, HelpCenterTemplate){
	var HelpCenterView = BaseView.extend({

		className:"view-help-center",

		template: _.template(HelpCenterTemplate),

		events: {
			"submit form" : "sendFeedback",
			"change .upload": "uploadCertification",
			"click .btn-upload": "clickUpload"
		}, 
		
		theme: "account",

		uploadCertification: function(event) {

			var cb = function(file) {
				
				var parent = $(event.currentTarget).closest('div');
				var preview = parent.find('.preview');

				if( preview.length == 1 ) {
					preview.attr('href', file.url());
				} else {
					var link = $('<a>').attr({ 'href': file.url(), target: '_blank' }).text('File preview').addClass('preview');
					parent.append($('<p>').append(link));	
				}

			}

			this.uploadFile(event, cb, {
				triggerBtn: this.$el.find('button[for="'+$(event.currentTarget).attr("name")+'"]')
			});
		},

		sendFeedback: function(event) {

			event.preventDefault();

			var self = this;
			self.buttonLoader('Saving');
			self.cleanForm();

			var data = {
				category: this._in('category').val(),
				feedback: this._in('feedback').val(), 
				user: Parse.User.current(),
				file1: self.tempBinaries.file1,
				file2: self.tempBinaries.file2,
				file3: self.tempBinaries.file3
			};

			var reportSubmitSuccess = function() {

				self._info('Thank you for contacting the BoatDay team, we will get back to you soon.');
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