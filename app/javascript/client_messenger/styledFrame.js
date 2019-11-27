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
        {React.cloneElement(this.props.children, {
          document: this.props.document,
          window: this.props.window
        })}
        {/*this.props.children*/}
      </CacheProvider>
    )
  }
}

const initialFrameContent = '<!DOCTYPE html><html><head></head><body></body></html>'
const mountTarget='#mountHere'

const StyledFrame = ({ className, style, children, id }) => (

  <Frame className={className} style={style || {} } id={id}>
    <FrameContextConsumer>
      {
        // Callback is invoked with iframe's window and document instances
        ({document, window}) => {
          // Render Children
          return <CssInjector document={document} window={window}>
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