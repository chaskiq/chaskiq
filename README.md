
![image](https://user-images.githubusercontent.com/11976/81771025-eaefe780-94af-11ea-881b-ad7910536fee.png)

# Chaskiq 
## Open Source Messaging Platform for Marketing, Support & Sales
### The front line of your customer service.


<a href="https://travis-ci.org/chaskiq/chaskiq">
  <img src="https://travis-ci.org/chaskiq/chaskiq.svg?branch=master" alt="CI">
</a>

<a href="https://hub.docker.com/r/chaskiq/chaskiq">
  <img src="https://img.shields.io/docker/pulls/chaskiq/chaskiq.svg" alt="CI">
</a>

<a href="https://hub.docker.com/r/chaskiq/chaskiq">
  <img src="https://img.shields.io/docker/cloud/build/chaskiq/chaskiq" alt="CI">
</a>

<br/>

<a href="https://heroku.com/deploy?template=https://github.com/chaskiq/chaskiq/tree/master" alt="Deploy to Heroku">
    <img alt="Deploy" src="https://www.herokucdn.com/deploy/button.svg"/>
</a>



----

## Main features:

<img align="right" width="400" height="auto" src="https://user-images.githubusercontent.com/11976/81771031-f17e5f00-94af-11ea-9e2b-4df8128dfa6d.png">

- Customer Segment Filters with custom attributes support
- Web Messenger embed
- Agent's conversation routing
- Text chat with customizable content blocks support
- **Video Calls** !
- Triggerable conversational bots
- Mailing campaigns
- Onboarding tours
- API integrations - Whatsapp / Twitter DM / Slack / Calendly / Zoom and more!
- CRM integration - Pipedrive supported
- Webhooks
- Help Center system with multilanguage support
- API support - consumible via GrapqhQL with Oauth authorization
- Quick replies (as canned responses)

And many features to come

To learn more about the philosophy and goals of the project, [visit **chaskiq.io**](https://www.chaskiq.io).


### Embeddable WebChat:

<img align="right" width="300" height="auto" src="https://user-images.githubusercontent.com/11976/81771091-14107800-94b0-11ea-98a8-a714b0290f66.png">

- A powerful text editor for the chat based in Dante2 Wysiwyg.
- Animated Gifs.
- Embeddable Videos from Youtube, Vimeo.
- Embedable webpages via Oembed protocol.
- Video Recorder.
- Video Calls via RTC protocol.
- Third party apps like Calendly & Zoom.
- Colorized Code via Prism.js.

<hr>

![image](https://user-images.githubusercontent.com/11976/81775079-095ae080-94ba-11ea-9992-bce7f34e3ff0.png)

## Dashboard panel

<img align="right" width="300" height="auto" src="https://user-images.githubusercontent.com/11976/81775425-d5cc8600-94ba-11ea-90e2-bac4c8fa8d16.png">

We have designed the dashboard with an extensible & pluggable architecture, you can implement your own dashboard blocks to customize it with external data sources.

Also it can display the visit activity and the conversation performance like reply rate times & response averages.


## Help Center

Chaskiq has a powerful article content creator which can serve as a Help Center / Knowledge base system. it can live on a custom domain or in the same webchat for your customer auto assistance.

![image](https://user-images.githubusercontent.com/11976/81776113-33150700-94bc-11ea-84c7-86a694c13885.png)


## Development

To get your environment setup, follow the community setup guide for your operating system.

1. If you're on macOS, try the [macOS development guide](https://dev.chaskiq.io/en/articles/installation-on-mac).
1. If you're on Ubuntu, try the [Ubuntu development guide](https://dev.chaskiq.io/en/articles/install-chaskiq-on-ubuntu-for-development).
1. If you're on Windows, try the [Windows 10 development guide](https://dev.chaskiq.io/en/articles/install-discourse-on-windows-10-for-development).
1. If you want to develop on Docker [Docker Dev Guide](https://dev.chaskiq.io/en/articles/docker-for-development)


Before you get started, ensure you have the following minimum versions: [Ruby 2.6+](https://www.ruby-lang.org/en/downloads/), [PostgreSQL 10+](https://www.postgresql.org/download/), [Redis 2.6+](https://redis.io/download).

## Setting up Chaskiq

If you want to set up a Chaskiq for production use, see our [**Chaskiq Install Guide**](https://dev.chaskiq.io/en/collections/production-configuration).

## Requirements

Chaskiq is built for the *next* 10 years of the Internet, so our requirements are high:

| Browsers              | Tablets      | Phones       |
| --------------------- | ------------ | ------------ |
| Safari 10+            | iPad 4+      | iOS 10+      |
| Google Chrome 57+     | Android 4.4+ | Android 4.4+ |
| Internet Explorer 11+ |              |              |
| Firefox 52+           |              |              |

## Built With

- [Ruby on Rails](https://github.com/rails/rails) &mdash; Our back end API is a Rails app. It responds to requests RESTfully in JSON.
- [React.js](https://github.com/react/react.js) &mdash; Our front end is an React.js app that communicates with the Rails Graphql API.
- [PostgreSQL](https://www.postgresql.org/) &mdash; Our main data store is in Postgres.
- [Redis](https://redis.io/) &mdash; We use Redis as a cache and for transient data.

Plus *lots* of Ruby Gems, a complete list of which is at [/master/Gemfile](https://github.com/chaskiq/chaskiq/blob/master/Gemfile).

## Contributing

Chaskiq is **100% free** and **open source**. We encourage and support an active, healthy community that
accepts contributions from the public &ndash; including you!

## The Chaskiq Team

For a complete list of the many individuals that contributed to the design and implementation of Chaskiq, please refer to [GitHub's list of contributors](https://github.com/chaskiq/chaskiq/contributors).

## License

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Chaskiq under the terms of the GPLv3.

### Commercial license

The commercial license is designed to for you to use Chaskiq in commercial products and applications, without the provisions of the GPLv3. With the commercial license, your code is kept propietary, to yourself. See the Chaskiq Commercial License at [chaskiq.io](https://chaskiq.io/commercial-license)

