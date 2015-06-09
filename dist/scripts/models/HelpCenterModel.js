define([
'parse'
], function(Parse){
	var HelpCenterModel = Parse.Object.extend("HelpCenter", {

		defaults: {

			status: 'unread',
			category: null,
			feedback: null,
			user: null,
			file1: null,
			file2: null,
			file3: null
		},

		validate: function(attributes){

			var _return = { 
				fields: {},
				type: 'model-validation'
			};


			if( attributes.feedback == '' ) {
				_return.fields.feedback = 'Oops, you missed one!';
			}
	
			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}

		
	});
	return HelpCenterModel;
});