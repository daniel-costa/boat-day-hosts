define([
'models/CaptainRequestModel',
'views/BaseView',
'text!templates/ProfileTemplate.html'
], function(CaptainRequestModel, BaseView, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: "view-profile-add",

		template: _.template(ProfileTemplate),

		profilePicture: null,

		events: {
			"submit form" : "saveProfile",
			"change [name='profilePicture']": "uploadPicture",
			"blur [name='about']": "censorField",
			"click .btn-upload": "clickUpload"
		},

		theme: "account",

		displayName: null,
		
		initialize: function(){

			if( this.model.get('status') != 'creation' ) {
				this.tempBinaries.profilePicture = this.model.get('profilePicture');
			} else {
				var host = Parse.User.current().get('host');
				this.displayName = host.get('firstname') + ' ' + host.get('lastname').charAt(0) + '.';				
			}



		},

		render: function() {

			BaseView.prototype.render.call(this);

			if( this.model.get('status') == 'creation' ) {
				this.$el.find('button.btn-upload[for="profilePicture"], .picturePreview').hide();
			} else {
				this.$el.find('div.btn-upload[for="profilePicture"]').hide();
				this.displayProfilePicture(this.tempBinaries.profilePicture.url());
			}

			this.$el.find('.username').text(this.displayName);
			
			return this;
		},

		displayProfilePicture: function(url) {

			this.$el.find('button.btn-upload[for="profilePicture"], .picturePreview').show();
			this.$el.find('div.btn-upload[for="profilePicture"]').hide();
			this.$el.find('.picturePreview .picture').css({ backgroundImage: 'url('+url+')' });

		},

		uploadPicture: function (event) {

			var self = this;
			var cb = function(file) {
				
				self.displayProfilePicture(file.url());

			}

			this.uploadFile(event, cb, { pdf: false });

		},

		saveProfile: function(event) {

			event.preventDefault();

			var self = this;

			self.buttonLoader('Saving');
			self.cleanForm();

			var baseStatus = this.model.get('status');

			var data = {
				status: "complete",
				about: this._in('about').val(),
				profilePicture: this.tempBinaries.profilePicture,
			};

			if( baseStatus == 'creation' ) {
				data.displayName = self.displayName;
			}

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

					// ToDo add afterSave in parse cloud to do this
					var query = new Parse.Query(CaptainRequestModel);
					query.equalTo('email', Parse.User.current().getEmail());
					query.each(updateRequest).then(navigate, saveError);

				} else {
					
					Parse.history.navigate('my-profile', true);

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