define([
'parse'
], function(Parse){
	var ProfileModel = Parse.Object.extend("Profile", {

		defaults: {

			displayName: null, 
			profilePicture: null, 
			about: null

		},


		validate: function(attributes){

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.about == "" ) {

				_return.fields.about = "Description Required: Lets share little bit about you";
			}

			if( !attributes.profilePicture ) {

				_return.fields.profilePicture = "Picture Required: Please submit a profile picture!";

			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return ProfileModel;
});