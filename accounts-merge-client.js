import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

Meteor.startup(function () {
  getLoginMethodNames().forEach(createSignInMethodForLoginMethod)
})

function getLoginMethodNames() {
  return Object.keys(Meteor).filter(methodName => methodName.startsWith('loginWith'))
}

function createSignInMethodForLoginMethod(logInMethodName) {
  Meteor[logInMethodName.replace('loginWith', 'signInWith')] = function (options, callback) {
    Meteor.signInWithExternalService(logInMethodName, options, callback)
  }
}


Meteor.signInWithExternalService = function (logInMethodName, options, callback) {
  const oldUserId = Meteor.userId()
  const oldLoginToken = Accounts._storedLoginToken()

  callback = typeof callback === 'function' ? callback : function () {}

  Meteor[logInMethodName](options, function (error) {
    if (error) {
      return callback(error)
    }

    const newUserId = Meteor.userId()

    if (!oldUserId || newUserId === oldUserId) {
      return callback()
    }

    Meteor.call('mergeAccounts', oldUserId, oldLoginToken, function (error, result) {
      if (error) {
        return callback (error)
      }

      // Log back in as the original (destination) user
      Meteor.loginWithToken(oldLoginToken, function (error) {
        if (error) {
          return callback (error)
        } else {
          return callback (undefined, newUserId)
        }
      })
    })
  })
}
