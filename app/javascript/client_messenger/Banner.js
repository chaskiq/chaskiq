import React from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import StyledFrame from './styledFrame'
import DanteContainer from './textEditor/editorStyles'
import 'draft-js/dist/Draft.css'
import theme from './textEditor/theme'
import { ThemeProvider } from 'emotion-theming'

const BannerWrapp = styled.div`

  ${
    ({ mode }) => mode === 'inline' ? tw`inset-x-0` : ''
  }

  ${
    ({ mode }) => mode === 'floating' ? tw`inset-x-0` : ''
  }

  .w{
    ${
      ({ mode }) => mode === 'inline' ? tw`` : ''
    }

    ${
      ({ mode }) => mode === 'floating' ? tw`px-2 sm:px-6 lg:px-8` : ''
    }
  }
  
  .color{
    ${tw`p-2 sm:p-3`}

    ${
      ({ bg_color }) => `background-color: ${bg_color};`
    }

    ${
      ({ mode }) => mode === 'floating' ? tw`rounded-lg shadow-lg ` : ''
    }
  }

  .content-wrapp {
    ${tw`flex items-center justify-between flex-wrap`}
  }

  .content-centered{
    ${tw`flex-1 flex items-center`}
  }

  .icon {
    ${tw`flex p-2 rounded-lg bg-indigo-800`}
    svg{
      ${tw`h-6 w-6 text-white`}
    }
  }

  .content-text {
    min-width: 250px;
    ${tw`ml-3 font-medium text-white truncate`}
  }

  .avatar {
    ${tw`flex p-2 rounded-full h-12 w-12`}
  }

  .action-wrapper{
    ${tw`order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto`}
    button.link{
      ${tw`flex items-center w-full sm:w-auto justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium  bg-white`}
      ${
        ({ bg_color }) => `color: ${bg_color};`
      }
    }
  }

  .button-wrapper {
    ${tw`order-2 flex-shrink-0 sm:order-3 sm:ml-2`}
    button {
      border: none;
      // focus:ring-2 focus:ring-white
      ${tw`-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none bg-transparent`}
      svg {
        ${tw`h-6 w-6 text-white`}
      }
    }
  }

`

const DanteExtendedContainer = styled(DanteContainer)`
  color: white;
  ${tw`text-xs sm:text-lg`}
`

export default function Banner ({
  mode,
  placement,
  bg_color,
  serialized_content,
  show_sender,
  action_text,
  dismiss_button,
  sender_data,
  url,
  onAction,
  onClose
}) {

  const [height, setHeight] = React.useState('73px')

  const style = {
    position: 'fixed',
    left: '0px',
    width: '100%',
    height: height,
    border: 'transparent',
    zIndex: 4000000000
  }

  function heightHandler (height){
    setHeight(height)
  }

  if (placement === 'top' && mode === 'floating') {
    style.top = '8px'
    style.height = '80px'
  }

  if (placement === 'bottom' && mode === 'floating') {
    style.bottom = '8px'
  }

  if (placement === 'top' && mode === 'inline') {
    style.top = '-1px'
  }

  if (placement === 'bottom' && mode === 'inline') {
    style.bottom = '-1px'
  }

  function textRenderer () {
    return <ThemeProvider
      theme={ theme }>
      <DanteExtendedContainer>
        {serialized_content}
      </DanteExtendedContainer>
    </ThemeProvider>
  }

  return <StyledFrame data-cy="banner-wrapper" style={style}>
    <BannerRenderer
      mode={mode}
      placement={placement}
      bg_color={bg_color}
      notifyHeight={heightHandler}
      textComponent={textRenderer()}
      show_sender={show_sender}
      action_text={action_text}
      sender_data={sender_data}
      dismiss_button={dismiss_button}
      url={url}
      onAction={onAction}
      onClose={onClose}
    />
  </StyledFrame>
}


// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = React.useState({
    width: undefined,
    height: undefined,
  });
  React.useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export function BannerRenderer ({
  mode,
  placement,
  bg_color,
  textComponent,
  show_sender,
  action_text,
  dismiss_button,
  sender_data,
  url,
  onAction,
  onClose,
  notifyHeight
}) {

  let wrapper = React.useRef(null)

  const size = useWindowSize();

  React.useEffect(()=>{
    notifyHeight(wrapper.current.clientHeight)
  }, [])

  React.useEffect(()=>{
    notifyHeight(wrapper.current.clientHeight)
  }, [size])


  return (
    <BannerWrapp
      placement={placement}
      bg_color={bg_color}
      mode={mode}>
      <div className="w">
        <div className="color" ref={wrapper}>
          <div className="content-wrapp">
            <div className="content-centered">

              {
                show_sender && sender_data &&
                  <img src={sender_data.avatarUrl} className="avatar"/>
              }

              <div className="content-text">
                {
                  textComponent && textComponent
                }
              </div>
            </div>

            <div className="action-wrapper">
              { action_text && url &&
                <button type='button'
                  onClick={(e) => {
                    e.preventDefault()
                    onAction && onAction(url)
                  }}
                  className="link">
                  {action_text}
                </button>
              }
            </div>

            <div className="button-wrapper">
              { dismiss_button &&
                <button onClick={onClose} type="button">
                  {/* <span className="sr-only">Dismiss</span> */}
                  <svg className=""
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </BannerWrapp>
  )
}
