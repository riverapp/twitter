(function(R) {
	var TwitterStreamProvider = function() {

	};

	/**
		Provides details about the type of authentication that will be performed
		so that the application may display an appropriate interface.
		@return object in the form given here
	*/
	TwitterStreamProvider.prototype.authRequirements = function() {
		return {
			authType: "credentials",
			field1: {
					"name": "Username",
					"type": "text",
					"identifier": "username"
			},
			field2:	{
				"name": "Password",
				"type": "secure",
				"identifier": "password"
			}
		};
	};

	return new TwitterStreamProvider();
})