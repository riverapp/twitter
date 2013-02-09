class Twitter

  constructor: (delegate) ->
    @OAUTH_CONSUMER_KEY = 'A2LGbh5RqwVe4GYYCrgQ'
    @OAUTH_CONSUMER_SECRET = 'nSQMQ2YK3On7e3c9sp4DPMAKDKthzDVbBuUXwmh4HVo'

    @oauth_request_token_url = 'https://api.twitter.com/oauth/request_token'
    @oauth_authorize_token_url = 'https://api.twitter.com/oauth/authorize?oauth_token='
    @oauth_access_token_url = 'https://api.twitter.com/oauth/access_token'

    @timeline_url = 'https://api.twitter.com/1/statuses/home_timeline.json'
    @avatar_url = 'http://api.twitter.com/1/users/profile_image?size=bigger&screen_name='
    @delegate = delegate

  ### 
    Authentication
  ###

  authRequirements: (callback) ->
    @requestToken (err, response) =>
      if err
        console.log err
        return callback(err)
      response = parseQueryString response
      console.log 'url: ' + @oauth_authorize_token_url + response.oauth_token
      callback {
        authType: 'oauth',
        url: @oauth_authorize_token_url + response.oauth_token
      }
      

  requestToken: (callback) ->
    callbackURL = @delegate.callbackURL()
    HTTP.request({
      url: @oauth_request_token_url,
      method: 'POST',
      oauth: {
        oauth_consumer_key: @OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: @OAUTH_CONSUMER_SECRET,
        oauth_version: '1.0',
        oauth_callback: callbackURL
      }
    }, callback)

  authenticate: (params) ->
    HTTP.request {
      url: @oauth_access_token_url,
      method: 'POST',
      parameters: {
        'oauth_verifier': params.oauth_verifier
      },
      oauth: {
        oauth_consumer_key: @OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: @OAUTH_CONSUMER_SECRET,
        oauth_token: params.oauth_token,
        oauth_version: '1.0'
      }
    }, (err, response) =>
      if err
        console.log err
        return
      response = parseQueryString response
      @createAccount response

  createAccount: (params) ->
    @delegate.createAccount {
      name: params.screen_name,
      identifier: params.user_id,
      secret: JSON.stringify({
        oauth_token: params.oauth_token,
        oauth_token_secret: params.oauth_token_secret
      })
    }

  ###
    Updating
  ###

  update: (user, callback) ->
    secret = JSON.parse(user.secret)
    HTTP.request {
      url: @timeline_url,
      method: 'GET',
      oauth: {
        oauth_consumer_key: @OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: @OAUTH_CONSUMER_SECRET,
        oauth_token: secret.oauth_token,
        oauth_token_secret: secret.oauth_token_secret,
        oauth_version: '1.0'
      }
    }, (err, response) =>
      if err
        console.log err
        callback err, null
        return
      statuses = @parseStatuses response
      callback null, statuses

  parseStatuses: (rawStatuses) ->
    statuses = []
    rawStatuses = JSON.parse rawStatuses
    for s in rawStatuses
      status = new StatusUpdate()
      status.text = s.text
      status.origin = s.user.name
      status.originID = '@' + s.user.screen_name
      status.originImageURL = @avatar_url + s.user.screen_name
      status.createdTime = +(new Date(s.created_at) / 1000)
      status.id = s.id.toString()
      statuses.push status
    return statuses
  
  ###
    Configuration
  ###

  updatePreferences: (callback) ->
    callback {
      'interval': 60,
      'min':      30,
      'max':      300
    }
      

PluginManager.registerPlugin(Twitter, 'me.danpalmer.River.plugins.Twitter')