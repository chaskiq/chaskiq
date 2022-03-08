//import React from 'react';
//import ReactDOM from 'react-dom';

import { Turbo } from '@hotwired/turbo-rails';
window.Turbo = Turbo;

//import '../src/styles/tailwind.css';
//import '../assets/stylesheets/application.tailwind.css'
import 'rc-tooltip/assets/bootstrap.css';
// import App from '../src/App'

// eslint-disable-next-line no-undef
/*document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <App />,
    document.body.appendChild(document.getElementById('main-page'))
  )
})*/

import './controllers';
import '../frontend/components/index';
