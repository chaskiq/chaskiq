import React from 'react'
import Content from '../components/Content'
import EmptyView from '../components/EmptyView'
import image from '../images/notfound-icon8.png'
import logo from '../images/logo.png'
import { Link } from 'react-router-dom'
import I18n from '../shared/FakeI18n'

export default function NoFound () {
  return (
    <Content>
      <img src={logo} />

      <EmptyView
        title="Not found"
        subtitle={
          <span>
            {I18n.t('common.not_found')}
            <Link to="/">{I18n.t('common.back_to_site')}</Link>
          </span>
        }
        image={<img src={image} alt="not found" />}
      ></EmptyView>
    </Content>
  )
}
