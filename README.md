# Hermes

Hermes (Hermessenger) is a platform that enables chat comunication with users in app or via campaigns (in app messages or newsletters). The platform is made with React, Redux and Ruby on Rails on backend serving a graphql api.

## Main features:

### Intercom's like messenger. widget based chat application:

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaFVCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d44a670bbacb49c154f0ba0035e452bf847b7138/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaFVCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d44a670bbacb49c154f0ba0035e452bf847b7138/image.png)

## Messenger app

The widget registers users's visits and identify by a client given id. All the comunication is transmited securely via JWE (json web encryption)

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaFlCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--1a55e7a4b8fc6e16afd7b8ca63df35b85cce6f9b/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaFlCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--1a55e7a4b8fc6e16afd7b8ca63df35b85cce6f9b/image.png)

widget integration
## Backend

### Platform

When users visits a site with the hermes integration, they are registered in the platform database which registers the data provided by the integrator and also many browser's properties. (os, os version, user agent etc..).

In the administration page you can see who is online and add "segments" which enables filters for you to query different properties on user information. ie: active users, sleeping away etc.. It's entirely customizable.

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaGNCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--3876ce9cd9dd09b276faf03916d9bc27f01044bb/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaGNCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--3876ce9cd9dd09b276faf03916d9bc27f01044bb/image.png)

platform's visitors list

### Campaigns

There are 2 modes of campaign implemented - In app message and mailing.

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaGdCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--2cdc923c57fdc387bedf4cf20800cfc1a1d81f59/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaGdCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--2cdc923c57fdc387bedf4cf20800cfc1a1d81f59/image.png)

#### campaigns menu

when the campaign is active you can see the metrics on the campaign. ie , who saw, click , close etc..

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaGtCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--905ba56fee749d092c477750eb1e82a80131f51c/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaGtCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--905ba56fee749d092c477750eb1e82a80131f51c/image.png)

#### campaign stats

Also you can configure campaign using segments to target audience:

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaG9CIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--040a242d36ac66b2c61ab7ac79574eef5dfa93d7/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaG9CIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--040a242d36ac66b2c61ab7ac79574eef5dfa93d7/image.png)

#### campaign's segment manager

An the content of the campaign is managed with a state of the art wysiwyg text editor (dante2)

![https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHdCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a04a59ec8f3dbdc3ee7ff129b2592e3cc6f25029/image.png](https://proseflow.herokuapp.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHdCIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a04a59ec8f3dbdc3ee7ff129b2592e3cc6f25029/image.png)

### cors amazon policies

```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>Authorization</AllowedHeader>
</CORSRule>
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```


### third party services
+ https://ipapi.co/#pricing


## references:
+ https://get.slaask.com/
+ https://smooch.io/
+ https://frontapp.com
+ https://www.drift.com/
+ www.jivochat.cl/‎
+ https://www.tawk.to/
+ https://www.tawk.to/knowledgebase/
+ https://beebom.com/intercom-alternatives/
+ https://purechat.com/pricing
+ https://freshdesk.com/predictive-support
+ https://crisp.chat/en/livechat/?ref=chatbox&domain=codetrace.io&name=CodeTrace
+ https://getstream.io/enterprise/
+ https://home.pandorabots.com/home.html#pricing

## data gather

+ https://www.quora.com/Which-is-the-most-accurate-IP-geolocation-service

+ https://ipgeolocation.io/pricing.html
+ https://www.fullcontact.com/pricing-plans/
+ https://clearbit.com/pricing

+ https://www.intercom.com/help/articles/277-where-do-the-social-profiles-come-from


### messenger implementations

+ https://matrix.org/docs/projects/bots

### browser navigation

+ http://html2canvas.hertzen.com/

## auth 

+ https://github.com/saitoxu/react-devise-token-auth-sample

# themes

+ https://preview.themeforest.net/item/react-next-modern-landing-page-template/full_screen_preview/23169879

+ https://fontsinuse.com/uses/2176/apple-advertising-of-the-1970s-80s
+ https://fontsinuse.com/uses/2176/apple-advertising-of-the-1970s-80s