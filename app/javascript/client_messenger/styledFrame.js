import sanitizeHtml from 'sanitize-html';
import TourManager from './tourManager'
import React from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/core'

class CssInjector extends React.Component {
  constructor(props) {
    super(props)
    //const iframe = document.getElementsByTagName('iframe')[0]
    //const iframe = document.getElementsByTagName('iframe')[0]
    //const iframeHead = iframe.contentDocument.head
    const iframeHead = this.props.document.head

    this.cache = createCache({ container: iframeHead })
  }

  render() {
    return (
      <CacheProvider value={this.cache}>
        {this.props.children}
      </CacheProvider>
    )
  }
}

const initialFrameContent = '<!DOCTYPE html><html><head></head><body></body></html>'
const mountTarget='#mountHere'

const StyledFrame = ({ className, style, children }) => (

  <Frame className={className} style={style || {} }>
    <FrameContextConsumer>
      {
        // Callback is invoked with iframe's window and document instances
        ({document, window}) => {
          // Render Children
          return <CssInjector document={document}>
                    {children}
                  </CssInjector>
        }
      }
    </FrameContextConsumer>
  </Frame>
)

export default StyledFrame

/*
export default class StyledFrame extends React.Component {
  render(){
    return <Frame style={this.props.style || {} }>
            <FrameContextConsumer>
              {
                // Callback is invoked with iframe's window and document instances
                ({document, window}) => {
                  // Render Children
                  return <CssInjector document={document}>
                            {this.props.children}
                          </CssInjector>
                }
              }
            </FrameContextConsumer>
          </Frame>
  }
}
*/