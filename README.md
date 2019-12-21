Chaskiq is the 100% open source discussion platform built for the next decade of the Internet. Use it as a:


# Chaskiq

Chaskiq is a platform that enables chat comunication with users in app or via campaigns (in app messages or newsletters). The platform is made with React, Redux and Ruby on Rails on backend serving a graphql api.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/michelson/chaskiq/tree/master)

![CI](https://github.com/michelson/chaskiq/workflows/CI/badge.svg)


## Main features:

### Intercom's like messenger. widget based chat application:

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaFVCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d44a670bbacb49c154f0ba0035e452bf847b7138/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaFVCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d44a670bbacb49c154f0ba0035e452bf847b7138/image.png)

- segments
- conversations
  - agent auto assignment
  - extensible editor with many kind of blocks ie: image, code, video , embed, giphy etc..
- campaigns
  - newsletters with programable scheduling
  - user auto messages, send messages to visitors thourgh fine grained segments
  - onboarding tours
- data enrichment
- api integrations
- programable bots and composable paths of conversations
- report dashboard with visits avg response & resolution times

To learn more about the philosophy and goals of the project, [visit **chaskiq.io**](https://www.chaskiq.io).

## Screenshots


## Development

To get your environment setup, follow the community setup guide for your operating system.

1. If you're on macOS, try the [macOS development guide](https://dev.chaskiq.io/en/articles/mac-os-installation-guide).
1. If you're on Ubuntu, try the [Ubuntu development guide](https://dev.chaskiq.io/en/articles/ubuntu-installation-guide).
1. If you're on Windows, try the [Windows 10 development guide](https://dev.chaskiq.io/en/articles/windows-10-installation-guide
  https://meta.chaskiq.io/t/beginners-guide-to-install-discourse-on-windows-10-for-development/75149).

If you're familiar with how Rails works and are comfortable setting up your own environment, you can also try out the [**Chaskiq Advanced Developer Guide**](docs/DEVELOPER-ADVANCED.md), which is aimed primarily at Ubuntu and macOS environments.

Before you get started, ensure you have the following minimum versions: [Ruby 2.5+](https://www.ruby-lang.org/en/downloads/), [PostgreSQL 10+](https://www.postgresql.org/download/), [Redis 2.6+](https://redis.io/download). If you're having trouble, please see our [**TROUBLESHOOTING GUIDE**](docs/TROUBLESHOOTING.md) first!

## Setting up Chaskiq

If you want to set up a Chaskiq for production use, see our [**Chaskiq Install Guide**](https://dev.chaskiq.io/en/articles/installation).

If you're looking for business class hosting, see [chaskiq.io/buy](https://www.chaskiq.io/buy/).

## Requirements

Chaskiq is built for the *next* 10 years of the Internet, so our requirements are high:

| Browsers              | Tablets      | Phones       |
| --------------------- | ------------ | ------------ |
| Safari 10+           | iPad 4+      | iOS 10+       |
| Google Chrome 57+     | Android 4.4+ | Android 4.4+ |
| Internet Explorer 11+ |              |              |
| Firefox 52+           |              |              |

## Built With

- [Ruby on Rails](https://github.com/rails/rails) &mdash; Our back end API is a Rails app. It responds to requests RESTfully in JSON.
- [React.js](https://github.com/react/react.js) &mdash; Our front end is an React.js app that communicates with the Rails Graphql API.
- [PostgreSQL](https://www.postgresql.org/) &mdash; Our main data store is in Postgres.
- [Redis](https://redis.io/) &mdash; We use Redis as a cache and for transient data.

Plus *lots* of Ruby Gems, a complete list of which is at [/master/Gemfile](https://github.com/michelson/chaskiq/blob/master/Gemfile).

## Contributing

[![Build Status](https://api.travis-ci.org/michelson/chaskiq.svg?branch=master)](https://travis-ci.org/michelson/chaskiq)

Chaskiq is **100% free** and **open source**. We encourage and support an active, healthy community that
accepts contributions from the public &ndash; including you!

Before contributing to Chaskiq:

We look forward to seeing your pull requests!

## Security

We take security very seriously at Chaskiq; all our code is 100% open source and peer reviewed. Please read [our security guide](https://github.com/michelson/chaskiq/blob/master/docs/SECURITY.md) for an overview of security measures in Chaskiq, or if you wish to report a security issue.

## The Chaskiq Team

For a complete list of the many individuals that contributed to the design and implementation of Chaskiq, please refer to [GitHub's list of contributors](https://github.com/michelson/chaskiq/contributors).

## Copyright / License

Copyright 2019 Chaskiq, Inc.

Licensed under the GNU General Public License Version 2.0 (or later);
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
