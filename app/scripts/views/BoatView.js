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

		initialize: function(){

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

			if( e.target.files.length == 1) {

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

					// $(e.target).after($(e.target).clone()).attr('disabled', 1);
					self.tempBoatPicture = parseFile;
					self.buttonLoader();

				};

				var uploadError = function(error) {

					console.log(error);
					this._error('An error occured when we tried to upload your picture, try again please.');
					self.buttonLoader();

				};
				
				var parseFile = new Parse.File(name, file);
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},


		uploadInsurance: function () {

			var self = this;
			var e = event;

			self.buttonLoader('uploading file');

			if( e.target.files.length == 1) {

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
					
					self.tempInsurance = parseFile;
					self.buttonLoader();

				};

				var uploadError = function(error) {

					console.log(error);
					this._error('An error occured when we tried to upload your file, try again please.');
					self.buttonLoader();

				};
				
				var parseFile = new Parse.File(name, file);
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		save: function() {

			event.preventDefault();

			var self = this;


			var data = {
				name : this._in('name').val(),
				hullID : this._in('hullID').val(),
				length : this._in('length').val(),
				capacity : this._in('capacity').val(),
				insurance: this.tempInsurance,
				boatPicture: this.tempBoatPicture
			};

			var saveSuccess = function( boat ) {
				
				var host = Parse.User.current().get("host");
				var relation = host.relation('boats');
				relation.add(boat);
				host.save().then(function() { Parse.history.navigate('dashboard', true); }, function(error) { console.log(error)});

			};

			var saveError = function(error) {
				
				self._error(error);

			};
			
			this.model.save(data).then(saveSuccess, saveError);
		}

	});
	return BoatView;
});