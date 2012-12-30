(function() {

  var Twitter = function(delegate) {
    this.OAUTH_CONSUMER_KEY = 'A2LGbh5RqwVe4GYYCrgQ';
    this.OAUTH_CONSUMER_SECRET = 'nSQMQ2YK3On7e3c9sp4DPMAKDKthzDVbBuUXwmh4HVo';

    this.oauth_request_token_url = 'https://api.twitter.com/oauth/request_token';
    this.oauth_authorize_token_url = 'https://api.twitter.com/oauth/authorize?oauth_token=';
    this.oauth_access_token_url = 'https://api.twitter.com/oauth/access_token';
    this.timeline_url = 'https://api.twitter.com/1/statuses/home_timeline.json';
    
    this.delegate = delegate;
  };

  Twitter.prototype.authRequirements = function(callback) {
    var self = this;
    self.requestToken(function(err, response) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      response = parseQueryString(response);
      callback({
        authType: "oauth",
        url: self.oauth_authorize_token_url + response.oauth_token
      });
    });
  };

  Twitter.prototype.requestToken = function(callback) {
    var callbackURL = this.delegate.callbackURL();
    HTTP.request({
      url: this.oauth_request_token_url,
      method: 'POST',
      oauth: {
        oauth_consumer_key: this.OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: this.OAUTH_CONSUMER_SECRET,
        oauth_version: '1.0',
        oauth_callback: callbackURL
      }
    }, callback);
  };

  Twitter.prototype.authenticate = function(params) {
    var self = this;
    self.accessToken(params, function(err, response) {
      if (err) {
        console.log(err);
        return;
      }
      response = parseQueryString(response);
      self.createAccount(response);
    });
  };

  Twitter.prototype.accessToken = function(params, callback) {
    HTTP.request({
      url: this.oauth_access_token_url,
      method: 'POST',
      parameters: {
        'oauth_verifier': params.oauth_verifier
      },
      oauth: {
        oauth_consumer_key: this.OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: this.OAUTH_CONSUMER_SECRET,
        oauth_token: params.oauth_token,
        oauth_version: '1.0'
      }
    }, callback);
  };

  Twitter.prototype.createAccount = function(params) {
    console.log(params);
    this.delegate.createAccount({
      name: params.screen_name,
      identifier: params.user_id,
      secret: JSON.stringify({
        oauth_token: params.oauth_token,
        oauth_token_secret: params.oauth_token_secret
      })
    });
  };

  Twitter.prototype.update = function(user, callback) {
    var self = this;
    var secret = JSON.parse(user.secret);
    HTTP.request({
      url: this.timeline_url,
      method: 'GET',
      oauth: {
        oauth_consumer_key: this.OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: this.OAUTH_CONSUMER_SECRET,
        oauth_token: secret.oauth_token,
        oauth_token_secret: secret.oauth_token_secret,
        oauth_version: '1.0'
      }
    }, function(err, response) {
      if (err) {
        console.log(err);
        callback(err, null);
        return;
      }
      var statuses = [];
      var raw_statuses = JSON.parse(response);
      for (var i = 0; i < raw_statuses.length; i++) {
        var s = new StatusUpdate();
        s.text = raw_statuses[i].text;
        s.origin = raw_statuses[i].user.name;
        s.originImageURL = raw_statuses[i].user.profile_image_url;
        s.createdTime = +(new Date(raw_statuses[i].created_at) / 1000);
        s.id = raw_statuses[i].id.toString();
        statuses.push(s);
      }
      callback(null, statuses);
    });
  };

  Twitter.prototype.updatePreferences = function(callback) {
    callback({
      'interval': 60, // 1 minute
      'min': 30,      // 30 seconds
      'max': 300      // 5 minutes
    });
  };

  PluginManager.registerPlugin(Twitter, 'me.danpalmer.River.plugins.Twitter');

})();