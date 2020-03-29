import { Global, css } from '@emotion/core'
import React from 'react'

export default function GlobalStyle() {
  
  return (<Global
          styles={css`
            .focus-outline-hidden :focus {
              outline: none;
            }

            div[data-tour-elem="controls"] {
              justify-content: center
            }

            .reactour__helper {
              outline: none;
            }
          `}
        />)
}