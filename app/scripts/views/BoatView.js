define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatTemplate.html'
], function($, _, Parse, BaseView, BoatTemplate){
	var BoatView = BaseView.extend({

		className: "view-boat",

		template: _.template(BoatTemplate),

		events: {

			"submit form" : "save",
			"change [name='boatPicture']": "uploadBoatPicture",
			"change [name='insurance']": "uploadInsurance"

		},

		tempBoatPicture: null,

		tempInsurance: null,

		initialize: function() {

			if( this.model.get('status') != 'creation' ) {
				this.tempInsurance = this.model.get('insurance');
				this.tempBoatPicture = this.model.get('boatPicture');
			}

		},

		buttonLoader: function( text ) {

			var button = this.$el.find('[type="submit"]');

			if( !text ) {
				button.removeAttr('disabled').text(button.attr('txt'));
			} else {
				button.attr('disabled', 1);
				button.attr('txt', button.text());
				button.text(button.text() + ' (' + text + ')');
			}
		},

		uploadBoatPicture: function () {
			
			var self = this;
			var e = event;

			self.buttonLoader('uploading picture');

			if( e.target.files.length == 1 ) {

				var file = e.target.files[0];
				var name;

				if( file.type == 'image/png' ) {
					
					name = 'profilePicture.png';

				} else if( file.type == 'image/jpeg' ) {

					name = 'profilePicture.jpg';

				} else {

					this._error('Your profile picture "' + file.name + '" must be in the format PNG or a JPEG');
					$(e.target).val('');
					self.buttonLoader();
					return null;

				}

				var uploadSuccess = function(file) {

					self.tempBoatPicture = file;
					self.buttonLoader();

				};

				var uploadError = function(error) {

					console.log(error);
					self._error('An error occured when we tried to upload your picture, try again please.');
					self.buttonLoader();

				};
				
				new Parse.File(name, file).save().then(uploadSuccess, uploadError);

			}

		},


		uploadInsurance: function () {

			var self = this;
			var e = event;

			self.buttonLoader('uploading file');

			if( e.target.files.length == 1 ) {

				var file = e.target.files[0];
				var name;

				if( file.type == 'image/png' ) {
					
					name = 'proofInsurance.png';

				} else if( file.type == 'image/jpeg' ) {

					name = 'proofInsurance.jpg';

				} else if( file.type == 'application/pdf' ) {

					name = 'proofInsurance.pdf';

				} else {

					this._error('Your proof of insurance "' + file.name + '" must be in the format PNG, JPEG or PDF');
					$(e.target).val('');
					self.buttonLoader();
					return;

				}

				var uploadSuccess = function(file) {

					self.tempInsurance = file;
					self.buttonLoader();

				};

				var uploadError = function(error) {

					console.log(error);
					self._error('An error occured when we tried to upload your file, try again please.');
					self.buttonLoader();

				};
				
				new Parse.File(name, file).save().then(uploadSuccess, uploadError);

			}

		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		save: function() {

			event.preventDefault();

			var self = this;
			var baseStatus = this.model.get('status');

			var data = {
				status: 'complete',
				name: this._in('name').val(),
				hullID: this._in('hullID').val(),
				length: this._in('length').val(),
				capacity: this._in('capacity').val(),
				insurance: this.tempInsurance,
				boatPicture: this.tempBoatPicture
			};

			var saveSuccess = function( boat ) {
				
				if( baseStatus == 'creation' ) {

					var hostSaveSuccess = function() {
						Parse.history.navigate('boat/'+boat.id, true);
					};

					var hostSaveError = function(error) {
						console.log(error);
					}

					var host = Parse.User.current().get("host");
					host.relation('boats').add(boat);
					host.save().then(hostSaveSuccess, hostSaveError);

				} else {
					
					Parse.history.navigate('dashboard', true);

				}

			};

			var saveError = function(error) {
				
				self._error(error);

			};
			
			this.model.save(data).then(saveSuccess, saveError);
		}

	});
	return BoatView;
});