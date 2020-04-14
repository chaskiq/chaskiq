import React from 'react'
import Content from '../components/Content'
import EmptyView from '../components/EmptyView'
import image from '../images/notfound-icon8.png'
import logo from '../images/logo.png'
import { Link } from 'react-router-dom'

export default function NoFound () {
  return (

    <Content>
      <img src={logo}/>

      <EmptyView
        title="Not found"
        subtitle={
          <span>
            The page you are looking for does not exist. {' '}
            <Link to="/">Back to site</Link>
          </span>

        }
        image={<img src={image} alt="not found"/>}
      >
      </EmptyView>
    </Content>
  )
}
