import React from 'react'
import ReactDOM from 'react-dom'
import Article from '../client_messenger/articles.js'

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Article />,
    document.body.appendChild(document.getElementById('main-page'))
  )
})
