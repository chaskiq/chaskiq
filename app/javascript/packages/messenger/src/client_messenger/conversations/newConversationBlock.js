import React from 'react'
import { NewConvoBtn, NewConvoBtnContainer } from '../styles/styled'
import { MessengerContext } from '../context'

export default function NewConversationBlock({ children, styles }) {
  const {
    value: { appData, i18n, displayNewConversation, transition },
  } = React.useContext(MessengerContext)

  return (
    appData.inboundSettings.enabled && (
      <NewConvoBtnContainer styles={styles}>
        {children && children}
        <NewConvoBtn in={transition} onClick={displayNewConversation}>
          {i18n.t('messenger.create_new_conversation')}
        </NewConvoBtn>
      </NewConvoBtnContainer>
    )
  )
}
