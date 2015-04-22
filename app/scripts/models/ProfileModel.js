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

			if( attributes.about == "" ) {

				return "Description Required: Please share little bit about your business!";
			}

			if( !attributes.profilePicture ) {

				return "Picture Required: Please submit a profile picture!";

			}

		}
 
	});
	return ProfileModel;
});