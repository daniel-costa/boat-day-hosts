define([
'parse'
], function(Parse){
	var ProfileModel = Parse.Object.extend("Profile", {

		defaults: {

			status: 'creation',
			displayName: null, 
			profilePicture: null, 
			about: null,

		},

		validate: function(attributes){

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.about == "" ) {

				_return.fields.about = "Oops, you missed one! Tell Guests a little about yourself.";
			}

			if( !attributes.profilePicture ) {

				_return.fields.profilePicture = "Oops, you missed one! Please upload a photo.";

			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return ProfileModel;
});