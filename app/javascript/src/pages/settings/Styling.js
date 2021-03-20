import React from 'react'
import Button from '../../components/Button'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
// import {ColorPicker} from '../../shared/FormFields'
import styled from '@emotion/styled'

import { ColorPicker } from '../../components/forms/ColorPicker'

const PatternButton = styled.button`
  padding: 0px;
  margin: 3px;
  display: inline-block;
  width: 60px;
  height: 60px;
`

const Image = styled.div`
  width: 60px;
  height: 60px;

  ${(props) => {
    return props.image ? `background-image: url(${props.image});` : ''
  }}

  background-size: 310px 310px,cover;
`

function CustomizationColors ({ settings, update, _dispatch }) {
  const [state, setState] = React.useState({
    customization_colors: settings.customizationColors || {}
  })

  /*const handleChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked })
  }*/

  const names = [
    'email-pattern',
    '5-dots',
    'greek-vase',
    'criss-cross',
    'chevron',
    'blue-snow',
    'let-there-be-sun',
    'triangle-mosaic',
    'dot-grid',
    'so-white',
    'cork-board',
    'hotel-wallpaper',
    'trees',
    'beanstalk',
    'fishnets-and-hearts',
    'lilypads',
    'floor-tile',
    'beige-tiles',
    'memphis-mini',
    'christmas-colour',
    'intersection',
    'doodles',
    'memphis-colorful'
  ]

  const pattern_base_url =
    'https://www.toptal.com/designers/subtlepatterns/patterns/'

  const patterns = names.map((o) => {
    return { name: o, url: pattern_base_url + o + '.png' }
  })

  function handleSubmit () {
    const { customization_colors } = state

    const data = {
      app: {
        customization_colors: customization_colors
      }
    }
    update(data)
  }

  function selectPattern (pattern) {
    const color = Object.assign({}, state.customization_colors, {
      pattern: pattern ? pattern.url : null
    })
    setState({ customization_colors: color })
  }

  return (
    <div>
      <div className="py-6">
        <p className="text-lg leading-6 font-medium  text-gray-900 py-4">
          Customize chat window
        </p>
      </div>

      <div className="flex">
        <div className="w-1/2 pr-3">
          <ColorPicker
            color={state.customization_colors.primary}
            colorHandler={(hex) => {
              const color = Object.assign({}, state.customization_colors, {
                primary: hex
              })
              setState({ customization_colors: color })
            }}
            label={'Primary color'}
          />
          <p>For color backgrounds, buttons ands</p>
        </div>

        <div className="w-1/2">
          <ColorPicker
            color={state.customization_colors.secondary}
            colorHandler={(hex) => {
              const color = Object.assign({}, state.customization_colors, {
                secondary: hex
              })
              setState({ customization_colors: color })
            }}
            label={'Secondary color'}
          />
          <p>Secondary color</p>
        </div>
      </div>

      <div className="flex py-4">
        <div className="w-1/2">
          <div>
            <PatternButton onClick={(_e) => selectPattern(null)}>
              <Image />
            </PatternButton>

            {patterns.map((o, i) => {
              return (
                <PatternButton key={`patterns-${i}`}
                  onClick={(_e) => selectPattern(o)}>
                  <Image image={o.url} />
                </PatternButton>
              )
            })}

            <p className="text-md leading-6 font-medium text-gray-400 pb-2">
              Choose a pattern From
              <a
                target={'blank'}
                href={'https://www.toptal.com/designers/subtlepatterns/'}
              >
                Subtle patterns
              </a>
            </p>
          </div>
        </div>

        {state.customization_colors.pattern && (
          <div className="w-1/2">
            <img src={state.customization_colors.pattern} />
          </div>
        )}
      </div>

      <hr />

      <div className="py-4">
        <Button
          onClick={handleSubmit}
          variant={'success'}
          size="md"
          color={'primary'}>
          {I18n.t('common.save')}
        </Button>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  const { drawer } = state
  return {
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(CustomizationColors))
