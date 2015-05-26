define([
'models/CaptainRequestModel',
'views/BaseView',
'text!templates/ThumbPictureTemplate.html',
'text!templates/ProfileTemplate.html'
], function(CaptainRequestModel, BaseView, ThumbPictureTemplate, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: "view-profile",

		template: _.template(ProfileTemplate),

		profilePicture: null,

		events: {
			"submit form" : "saveProfile",
			"change [name='profilePicture']": "uploadPicture",
			"blur [name='about']": "censorField",
			"click .btn-upload": "clickUpload"
		},

		theme: "account",
		
		initialize: function(){

			if( this.model.get('status') != 'creation' ) {
				this.tempBinaries.profilePicture = this.model.get('profilePicture');
			}

		},

		render: function() {

			BaseView.prototype.render.call(this);

			if( this.model.get('status') != 'creation' ) {
				this.displayProfilePicture(this.tempBinaries.profilePicture.url());
			}

			if( this._in('displayName').val() === '' ) {
				var host = Parse.User.current().get('host');
				var displayName = host.get('firstname') + ' ' + host.get('lastname').charAt(0) + '.';
				this._in('displayName').val(displayName);	
			}
			
			return this;
		},

		debugAutofillFields: function() {
			
			if( this.model.get('status') == 'creation' ) {

				this._in('about').val('something about me');

			}

		},

		displayProfilePicture: function(url) {

			var tpl = _.template(ThumbPictureTemplate);
			var tplData = { 
				id: null, 
				url: url,
				canDelete: false,
				fullWidth: true
			};

			this.$el.find('.profilePicturePreview').html(tpl(tplData));

		},

		uploadPicture: function (event) {

			var self = this;
			var cb = function(file) {
				
				self.displayProfilePicture(file.url());

			}

			this.uploadFile(event, cb, { pdf: false});

		},

		saveProfile: function(event) {

			event.preventDefault();

			var self = this;

			self.buttonLoader('Saving');
			self.cleanForm();

			var baseStatus = this.model.get('status');

			var data = {
				status: "complete",
				displayName: this._in('displayName').val(),
				about: this._in('about').val(),
				profilePicture: this.tempBinaries.profilePicture
			};

			var userStatusUpdateSuccess = function() {

				if( baseStatus == 'creation' ) {
					
					var navigate = function() {
						Parse.history.loadUrl( Parse.history.fragment );
					};

					var updateRequest = function(request) {
						request.save({
							captainProfile: self.model,
							captainHost: Parse.User.current().get('host')
						});
					}

					var query = new Parse.Query(CaptainRequestModel);
					query.equalTo('email', Parse.User.current().getEmail());
					query.each(updateRequest).then(navigate, saveError);

				} else {
					
					Parse.history.navigate('dashboard', true);

				}

			};

			var profileSuccess = function() {
				
				Parse.User.current().save({ status: 'complete' }).then(userStatusUpdateSuccess, saveError);

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

			this.model.save(data).then(profileSuccess, saveError);
		}

	});
	return ProfileView;
});