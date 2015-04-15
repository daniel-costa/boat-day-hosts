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

			if( attributes.displayName == "" ) {

				return "You must to enter a display name";

			}

			if( !attributes.profilePicture ) {

				return "You must to upload a profile picture";

			}

		}
 
	});
	return ProfileModel;
});