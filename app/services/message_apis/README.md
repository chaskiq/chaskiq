
# Chaskiq Plugins README

## Introduction

This README file is meant to provide guidance and information on creating and managing Chaskiq plugins. Chaskiq plugins are files located in the message_apis folder and are installed as AppPackages. These plugins enable you to extend the functionality of your Chaskiq application, and they can be developed locally or synced from the appstore.chaskiq.io.

# Getting Started

1. Setting up the development environment
Before you begin developing your plugin, make sure you have the following tools installed:


2. Creating a new plugin

To create a new Chaskiq plugin, follow these steps:

  `rails generate chaskiq_plugin Foo`

Start developing your plugin by adding the necessary code, dependencies, and assets.
Plugin Development
When developing your plugin, consider the following best practices:

+ Keep your plugin focused on a single feature or functionality.
+ Ensure that your plugin is compatible with the latest version of Chaskiq.
+ Test your plugin thoroughly before deploying it to a production environment.
+ Keep your plugin up-to-date with any changes in the Chaskiq API or libraries.
+ Document your plugin, including its purpose, installation process, and usage instructions.


## Chaskiq AppStore

In order to sync our plugins with the Chaskiq AppStore you will need to download with your `license_key`, 

  + Add your CHASKIQ_APPSTORE_KEY= to your env variables, if you are on development mode add it on `.env` file.
  + Run the download command to download your plugins `bundle exec rails packages:download`
  + To install the plugins you have downloaded run `bundle exec rails packages:install`

When you download the plugins what it happens is that the information of the plugins will be stored in your database. While the `install` will export this information and will create the AppPackage with the proper files in your codebase.

To find your `CHASKIQ_APPSTORE_KEY` go to the appstore.chaskiq.io site.

Developing and managing Chaskiq plugins is a great way to extend the functionality of your Chaskiq application and provide additional value to your users. By following these guidelines, you can ensure that your plugins are high-quality, reliable, and easy to use. Happy coding!