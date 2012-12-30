class Twitter
  constructor: (delegate) ->
    @delegate = delegate

  authRequirements: (callback) ->
    callback({
      authType: 'oauth',
      url: 'http://google.com/'
    })

PluginManager.registerPlugin(Twitter, 'me.danpalmer.River.plugins.Twitter')