Package.describe({
  name: 'sanjo:accounts-merge',
  version: '0.0.11',
  summary: 'Multiple login services for Meteor accounts',
  git: 'https://github.com/sanjo/meteor-accounts-merge.git',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.6.1.1');
  api.use('accounts-base', undefined, {weak: true});
  api.use('check');
  api.addFiles('accounts-merge-server.js', 'server');
  api.addFiles('accounts-merge-client.js', 'client');
  api.export('AccountsMerge');
});
