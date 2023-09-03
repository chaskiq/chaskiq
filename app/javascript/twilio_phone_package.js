import React from 'react';
import ReactDOM from 'react-dom';
import { I18n } from 'i18n-js';
import translations from './src/locales/translations.json';
import { CallList, PhoneCall } from './packages/twilio';

const i18n = new I18n(translations);

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', () => {
  const data_string = document.querySelector(
    'meta[name="data"]'
    //@ts-ignore
  ).content;

  const endpointURL = document.querySelector(
    'meta[name="endpoint-url"]'
    //@ts-ignore
  ).content;

  const contentType = document.querySelector(
    'meta[name="content-type"]'
    //@ts-ignore
  ).content;

  const userToken = document.querySelector(
    'meta[name="user-token"]'
    //@ts-ignore
  )?.content;

  const data = {
    ...JSON.parse(data_string),
  };

  ReactDOM.render(
    contentType && contentType === 'call-list' ? (
      <CallList
        data={data}
        endpointURL={endpointURL}
        userToken={userToken}
        i18n={i18n}
      />
    ) : (
      <PhoneCall data={data} endpointURL={endpointURL} i18n={i18n} />
    ),
    document.body.appendChild(document.getElementById('content'))
  );
});
