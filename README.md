
Chaskiq is a 100% open source conversational marketing platform build as an alternative for Intercom, Drift, and others, currently under active development.

<div align="center">
  <h1> Chaskiq</h1>
  Chaskiq is a platform that enables chat comunication with users in app or via campaigns (in app messages or newsletters). The platform is a Ruby on Rails app serving a graphql API which is consumed by a React application.
  It has minimal dependences , Postgres & Redis and interoperates with cdn providers like Amazon s3 and Amazon SES for email delivery. You can use other providers too.
  <br/>
</div>

<p align="center">
  <a href="https://heroku.com/deploy?template=https://github.com/chaskiq/chaskiq/tree/master" alt="Deploy to Heroku">
     <img alt="Deploy" src="https://www.herokucdn.com/deploy/button.svg"/>
  </a>
</p>

<p align="center">
  <img alt="Chaskiq CI Status" src="https://github.com/chaskiq/chaskiq/workflows/CI/badge.svg"/>
</p>


----

## Main features:

- **Segments** or users filters to trigger campaigns, messages and bots.
  - use build in attributes like "last sign in", "country", "nº of sessions" or provide your own attributes from your registered users.
- **Embedable Widget Messenger**
  - Embed web widget with a simple js snippet
  - Pass custom attributes to feed your segment properties
  - Secure data comunication with Encrypted data (JWE)
  - Multilanguage and Customizable color palette
- **Conversations**
  - Agent's auto assignment
  - Extensible Chat editor with many kind of blocks ie: image, code, video, embed, giphy and more.. it's based in <a href="http://github.com/chaskiq/Dante2">Dante2</a> editor
- **Campaigns**
  - **Newsletters** with programable scheduling and Audience target
    - track open, clicks and complaints
  - **User auto messages**, send messages to visitors through 
  segments
    - track open, clicks
  - **Receive & Reply** those unreaded messages from email and deliver the directly to the chat.
  - **Set Agent's team availability**, days with their time frames.
  - **Compose Onboarding** tours to give an awesome experience on your site
    - track open, clicks and skips
    - set which url the onboarding should trigger, support patterns like /*

  All Campaigns messages are powered by Dante2, with all the bells and whistles.
 

- **Data enrichment**, through third parties
- **Api integrations** & pluggable integrations (currently on the works)
- **Programable bots** and composable paths of conversations
- **Report dashboard** with visits avg response & resolution times
- **Help Center/ Knowledge base** in the box
  - Create articles & collections
  - multilanguage

And many features to come

To learn more about the philosophy and goals of the project, [visit **chaskiq.io**](https://www.chaskiq.io).

## Screenshots

### Intercom's like messenger. widget based chat application:

![image](https://dev.chaskiq.io/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBQZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--688ff53fe05a0d4a0ba1e8860c0749d35c76f6e5/image.png)

## Dashboard panel

![image](https://user-images.githubusercontent.com/11976/71302992-3682e700-2391-11ea-9920-21617d9bd574.png)

## Help Center
![image](https://user-images.githubusercontent.com/11976/71303031-d80a3880-2391-11ea-9798-34cc7e81e9d1.png)


## Development

To get your environment setup, follow the community setup guide for your operating system.

1. If you're on macOS, try the [macOS development guide](https://dev.chaskiq.io/en/articles/mac-os-installation-guide).
1. If you're on Ubuntu, try the [Ubuntu development guide](https://dev.chaskiq.io/en/articles/ubuntu-installation-guide).
1. If you're on Windows, try the [Windows 10 development guide](https://dev.chaskiq.io/en/articles/ubuntu-installation-guide).


Before you get started, ensure you have the following minimum versions: [Ruby 2.5+](https://www.ruby-lang.org/en/downloads/), [PostgreSQL 10+](https://www.postgresql.org/download/), [Redis 2.6+](https://redis.io/download).

## Setting up Chaskiq

If you want to set up a Chaskiq for production use, see our [**Chaskiq Install Guide**](https://dev.chaskiq.io/en/articles/installation).

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

## Copyright / License

Copyright 2019 Chaskiq.

Licensed under the GNU General Public License Version 2.0 (or later);
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
