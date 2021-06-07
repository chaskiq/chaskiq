import React from 'react'
import ReactDOM from 'react-dom'
import Article from '@chaskiq/messenger'

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Article />,
    document.body.appendChild(document.getElementById('main-page'))
  )
})
