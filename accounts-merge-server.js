import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

AccountsMerge = {}

Meteor.methods({
  // Merge the newAccount into the oldAccount and mark the newAccount as merged
  mergeAccounts: function (oldUserId, oldLoginToken) {
    check(oldUserId, String)
    check(oldLoginToken, String)

    // This method (mergeAccounts) is sometimes called an extra time (twice) if
    // the losing user is deleted from the DB using the AccountsMerge.onMerge
    // hook. The hook is executed before the loosing user has been logged
    // out and thus this.userId is null the second time this method is called.
    if (!this.userId) {
      return
    }

    const oldUser = Meteor.users.findOne(oldUserId)

    const oldHashedLoginToken = Accounts._hashLoginToken(oldLoginToken)
    if (!oldUser.services.resume.loginTokens.includes(
      loginToken => loginToken.hashedToken === oldHashedLoginToken
    )) {
      throw new Meteor.Error(403, 'We could not authenticate you as the owner of the old account')
    }

    const newUser = Meteor.user()

    const newUserUpdateQuery = {}
    const oldUserUpdateQuery = {}
    for (const serviceName of Accounts.oauth.serviceNames()) {
      if (newUser.services[serviceName]) {
        // Remove service from new user to prevent duplicated key error
        newUserUpdateQuery[`services.${serviceName}`] = ''
        oldUserUpdateQuery[`services.${serviceName}`] = newUser.services[serviceName]
      }
    }

    if (!(oldUser.profile && oldUser.profile.name) &&
      (newUser.profile && newUser.profile.name)
    ) {
      oldUserUpdateQuery['profile.name'] = newUser.profile.name
    }

    if (Object.keys(newUserUpdateQuery).length > 0) {
      Meteor.users.update(newUser._id, {$unset: newUserUpdateQuery})
    }
    Meteor.users.update(oldUser._id, {$set: oldUserUpdateQuery})

    if (AccountsMerge.onMerge) {
      AccountsMerge.onMerge(
        Meteor.users.findOne(oldUser._id),
        Meteor.users.findOne(newUser._id)
      )
    }
  }
})
