define([
'views/BaseView',
'models/ProfileModel',
'text!templates/HostTemplate.html'
], function(BaseView, ProfileModel, HostTemplate){
	var HostView = BaseView.extend({

		className: "view-host-registration",

		template: _.template(HostTemplate),

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

		render: function() {

			BaseView.prototype.render.call(this);
			
			var birthdateYear = this.model.get('birthdate') ? this.model.get('birthdate').getFullYear() : 1993;

			for(var i = 1940; i < new Date().getFullYear() - 22; i++) {
				this.$el.find('[name="birthdateYear"]').append($('<option>').val(i).text(i));
			}
			
			return this;
		},

		debugAutofillFields: function() {
			
			if( this.model.get('status') == 'creation' ) {
				this._in('firstname').val('Daniel');
				this._in('lastname').val('Costa');
				this._in('SSN').val('9861');
				this._in('businessName').val('Peer-to-Pier Technologies LLC');
				this._in('businessEin').val('46-4074689');
				this._in('phone').val('123-123-1234');
				this._in('street').val('9861 SW 117th Ct');
				this._in('city').val('Miami');
				this._in('zipCode').val('98613');
				this._in('accountHolder').val('Daniel Costa');
				this._in('accountNumber').val('1039531801');
				this._in('accountRouting').val('324377516');
			}
		},

		save: function(event) {

			event.preventDefault();

			var self = this;

			self.buttonLoader('Saving');
			self.cleanForm();

			var baseStatus = this.model.get('status');

			var data = {
				status: "complete",
				phone: this._in('phone').val(),
				street: this._in('street').val(),
				city: this._in('city').val(),
				zipCode: this._in('zipCode').val(),
				state: this._in('state').val(), 
				accountHolder: this._in('accountHolder').val(),
				accountNumber: this._in('accountNumber').val(),
				accountRouting: this._in('accountRouting').val(),
				firstname: this._in('firstname').val(),
				lastname: this._in('lastname').val(),
				birthdate: new Date(this._in('birthdateYear').val(), this._in('birthdateMonth').val()-1, this._in('birthdateDay').val()),
				SSN: this._in('SSN').val(),
				businessName: this._in('businessName').val(),
				businessEin: this._in('businessEin').val(),
				certBSC: self.tempBinaries.certBSC ? self.tempBinaries.certBSC : null,
				certCCL: self.tempBinaries.certCCL ? self.tempBinaries.certCCL : null,
				certMCL: self.tempBinaries.certMCL ? self.tempBinaries.certMCL : null,
				certFL:  self.tempBinaries.certFL  ? self.tempBinaries.certFL  : null,
				certSL:  self.tempBinaries.certSL  ? self.tempBinaries.certSL  : null,
				certFAC: self.tempBinaries.certFAC ? self.tempBinaries.certFAC : null,
				certStatusBSC: self.tempBinaries.certBSC ? 'pending' : null,
				certStatusCCL: self.tempBinaries.certCCL ? 'pending' : null,
				certStatusMCL: self.tempBinaries.certMCL ? 'pending' : null,
				certStatusFL:  self.tempBinaries.certFL  ? 'pending' : null,
				certStatusSL:  self.tempBinaries.certSL  ? 'pending' : null,
				certStatusFAC: self.tempBinaries.certFAC ? 'pending' : null,
				coupon: this._in('coupon').val()
			};
			
			var hostRegistrationSuccess = function() {

				if( baseStatus == 'creation' ) {

					Parse.history.loadUrl(Parse.history.fragment);

				} else {

					Parse.history.navigate("dashboard", true);

				}

			};

			var saveError = function(error) {
				self.handleSaveErrors(error);
			};

			this.model.save(data).then(hostRegistrationSuccess, saveError);
		}

	});
	return HostView;
});