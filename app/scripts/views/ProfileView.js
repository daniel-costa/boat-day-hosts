define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/ThumbPictureTemplate.html',
'text!templates/ProfileTemplate.html'
], function($, _, Parse, BaseView, ThumbPictureTemplate, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: "view-profile",

		template: _.template(ProfileTemplate),

		profilePicture: null,

		events: {
			"submit form" : "saveProfile",
			"change [name='profilePicture']": "uploadPicture"
		},

		initialize: function(){

			if( this.model.get('status') != 'creation' ) {
				this.profilePicture = this.model.get('profilePicture');
			}
		},

		render: function() {

			BaseView.prototype.render.call(this);

			if( this.model.get('status') != 'creation' ) {
				this.displayProfilePicture(this.model.get('profilePicture').url());
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
			console.log(url);
			this.$el.find('.profilePicturePreview').html(tpl(tplData));

		},

		uploadPicture: function () {

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			
			self.buttonLoader('Uploading...');

			if( files.length == 1) {

				if( files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File('profilePicture.png', files[0]);

				} else if( files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File('profilePicture.jpg', files[0]);

				} else {

					self.fieldError('profilePicture', 'Bad format, try with a PNG or JPEG picture.');
					self.buttonLoader();
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					
					self.profilePicture = file;
					self.displayProfilePicture(file.url());
					self.buttonLoader();

				};

				var uploadError = function(error) {

					self.fieldError('profilePicture', 'An error occured when we tried to upload your picture, try again please.');
					self.buttonLoader();

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}

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
				profilePicture: this.profilePicture
			};

			var userStatusUpdateSuccess = function() {

				if( baseStatus == 'creation' ) {
					Parse.history.loadUrl( Parse.history.fragment );
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