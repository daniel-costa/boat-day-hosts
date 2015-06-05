define([
'views/BaseView',
'text!templates/CertificationsTemplate.html'
], function(BaseView, CertificationsTemplate){
	var CertificationsView = BaseView.extend({

		className: "view-my-certifications",

		template: _.template(CertificationsTemplate),

		debug: true,

		theme: "account",
		
		events: {
			"submit form" : "save", 
			"change .upload": "uploadCertification",
			"click .btn-upload": "clickUpload"
		},

		uploadCertification: function(event) {

			var cb = function(file) {
				
				var parent = $(event.currentTarget).closest('div');
				var preview = parent.find('.preview');

				if( preview.length == 1 ) {
					preview.attr('href', file.url());
				} else {
					var link = $('<a>').attr({ 'href': file.url(), target: '_blank' }).text('Licence preview').addClass('preview');
					parent.append($('<p>').append(link));	
				}

			}

			this.uploadFile(event, cb);
		},

		save: function(event) {

			event.preventDefault();

			var self = this;

			self.buttonLoader('Saving');
			self.cleanForm();

			var baseStatus = this.model.get('status');

			var data = {};

			if( self.tempBinaries.certBSC ) {
				data.certBSC = self.tempBinaries.certBSC;
				data.certStatusBSC = 'pending';
			}

			if( self.tempBinaries.certCCL ) {
				data.certCCL = self.tempBinaries.certCCL;
				data.certStatusCCL = 'pending';
			}

			if( self.tempBinaries.certMCL ) {
				data.certMCL = self.tempBinaries.certMCL;
				data.certStatusMCL = 'pending';
			}

			if( self.tempBinaries.certFL  ) {
				data.certFL =  self.tempBinaries.certFL ;
				data.certStatusFL =  'pending';
			}

			if( self.tempBinaries.certSL  ) {
				data.certSL =  self.tempBinaries.certSL ;
				data.certStatusSL =  'pending';
			}

			if( self.tempBinaries.certFAC ) {
				data.certFAC = self.tempBinaries.certFAC;
				data.certStatusFAC = 'pending';
			}

			console.log(_.size(data));
			if(_.size(data) == 0) {
				self.buttonLoader();
				self._error('No certifications changed.');
				return;
			}

			var hostRegistrationSuccess = function() {

				Parse.history.navigate("my-account", true);

			};

			var saveError = function(error) {
				self.handleSaveErrors(error);
			};

			this.model.save(data).then(hostRegistrationSuccess, saveError);
		}

	});
	return CertificationsView;
});