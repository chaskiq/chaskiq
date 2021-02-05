import React from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import FormDialog from '../components/FormDialog'
import Prism from 'prismjs'
import I18n from '../shared/FakeI18n'

import styled from '@emotion/styled'

const Pre = styled.pre`
  background: black;
  color: white;
  font-size: .8em;
  overflow: auto;
`

function WebSetup ({ app, classes }) {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <React.Fragment>
      <button className="text-xs bg-green-500 hover:bg-green-600 text-green-100 font-bold py-1 px-2 rounded inline-flex items-center text-gray-100"
      onClick={handleClickOpen}>
        {I18n.t("common.get_snippet")}
      </button>

      <SimpleDialog app={app} open={open} onClose={handleClose} />
    </React.Fragment>
  )
}

function SimpleDialog (props) {
  // const classes = useStyles();
  const { onClose, open, app } = props

  const handleClose = () => {
    onClose()
  }

  function setupScript () {
    const hostname = window.location.hostname
    const port = window.location.port ? ':' + window.location.port : ''
    const secure = window.location.protocol === 'https:'
    const httpProtocol = window.location.protocol
    const wsProtocol = secure ? 'wss' : 'ws'
    const hostnamePort = `${hostname}${port}`

    const code = `
      <script>
        (function(d,t) {
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src="${httpProtocol}//${hostnamePort}/embed.js"
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            new window.ChaskiqMessengerEncrypted({
              domain: '${httpProtocol}//${hostnamePort}',
              ws:  '${wsProtocol}://${hostnamePort}/cable',
              app_id: "${app ? app.key : ''}",
              data: "YOUR_ENCRYPTED_JWE_DATA",
              lang: "USER_LANG_OR_DEFAULTS_TO_BROWSER_LANG" 
            })
          }
        })(document,"script");
      </script>
    `
    return Prism.highlight(code, Prism.languages.javascript, 'javascript')
  }

  return (
    <FormDialog
      fullWidth={true}
      maxWidth={'md'}
      handleClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      titleContent={'Web Messenger Setup'}
      formComponent={
        <div className="space-y-2">
          <p>{I18n.t('dashboard.snippet')}</p>
          <Pre>
            <div dangerouslySetInnerHTML={{ __html: setupScript() }} />
          </Pre>
        </div>
      }
    />
  )
}

function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(WebSetup))
