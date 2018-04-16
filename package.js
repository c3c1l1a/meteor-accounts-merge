Package.describe({
  name: 'sanjo:accounts-merge',
  version: '1.0.0',
  summary: 'Multiple login services for Meteor accounts',
  git: 'https://github.com/sanjo/meteor-accounts-merge.git',
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('1.6.1.1')
  api.use('ecmascript', ['client', 'server'])
  api.use('accounts-base', ['client', 'server'])
  api.use('check', ['server'])
  api.addFiles('accounts-merge-server.js', 'server')
  api.addFiles('accounts-merge-client.js', 'client')
  api.export('AccountsMerge', 'server')
})
