import './index.css'
// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//
import { Controller as BaseController } from "@hotwired/stimulus";

/*import React from 'react'
import { render } from 'react-dom'
import { post } from '@rails/request.js'
import EditorContainer from '@chaskiq/components/src/components/textEditor/editorStyles'
import DraftRenderer from '@chaskiq/components/src/components/textEditor/draftRenderer'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react';
import theme from '@chaskiq/components/src/components/textEditor/theme'*/
import themeDark from '@chaskiq/components/src/components/textEditor/darkTheme'

/*
const EditorContainerMessageBubble = styled(EditorContainer)`
  //display: flex;
  //justify-content: center;

  // this is to fix the image on message bubbles
  .aspect-ratio-fill {
    display: none;
  }
  .aspectRatioPlaceholder.is-locked .graf-image {
    position: inherit;
  }
`*/

export default class Controller extends BaseController {
  connect() {
		/*var message = JSON.parse(this.element.dataset.serialized)
		var messageForTheme = this.element.dataset.fromAdmin ? 
													this.element.dataset.isPrivateNote
                            ? theme
                            : themeDark
                          : theme*/

		/*render(
			<ThemeProvider theme={messageForTheme}>
				<EditorContainerMessageBubble>
					<DraftRenderer
						raw={message}
						html={this.element.dataset.html}
					/>
				</EditorContainerMessageBubble>
			</ThemeProvider>,
      this.element
    )*/

  }
  disconnect() {
  }
}
