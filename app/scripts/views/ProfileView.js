define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/ProfileTemplate.html'
], function($, _, Parse, BaseView, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: "view-profile",

		template: _.template(ProfileTemplate),

		profilePicture: null,

		events: {
			"submit form" : "saveProfile",
			"change [name='profilePicture']": "uploadPicture"
		},

		initialize: function(){

		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		uploadPicture: function () {

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			var button = this.$el.find('[type="submit"]');
			var txt = button.text();

			console.log(txt);
			button.attr('disabled', 1);
			button.text(txt + ' (uploading picture)');

			if( files.length == 1) {

				if( files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File('profilePicture.png', files[0]);

				} else if( files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File('profilePicture.png', files[0]);

				} else {

					this._error('Your profile picture must be in the format PNG or a JPEG');
					button.removeAttr('disabled').text(txt);
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					
					self.profilePicture = parseFile;
					button.removeAttr('disabled').text(txt);

				};

				var uploadError = function(error) {

					console.log(error);
					this._error('An error occured when we tried to upload your picture, try again please.');
					button.removeAttr('disabled').text(txt);

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},

		saveProfile: function() {

			event.preventDefault();

			var self = this;

			var data = {
				displayName: this._in('displayName').val(),
				about: this._in('about').val(),
				profilePicture: this.profilePicture
			};

			var userStatusUpdateSuccess = function() {

				Parse.history.loadUrl( Parse.history.fragment );

			};

			var profileSuccess = function() {
				
				Parse.User.current().save({ status: 'complete' }).then(userStatusUpdateSuccess, saveError);

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(profileSuccess, saveError);
		}

	});
	return ProfileView;
});