import React, {Component, useState, useEffect} from 'react'
import styled from '@emotion/styled'
import {
  AnchorButton,
  FadeRightAnimation,
  FadeBottomAnimation
} from './styles/styled'

import { ThemeProvider } from 'emotion-theming'
import theme from '../src/textEditor/theme'
import themeDark from '../src/textEditor/darkTheme'
import DraftRenderer from '../src/textEditor/draftRenderer'
import DanteContainer from '../src/textEditor/editorStyles'


import graphql from '../src/graphql/client'
import {
  ARTICLE,
  SEARCH_ARTICLES
} from '../src/graphql/docsQueries'

const Panel = styled.div`
  position: fixed;
  top: 75px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: scroll;
  width: 100%;
  height: 100%;
`

const ContentWrapper = styled.div`
  padding: 2em;
`

const Article = ({
  updateHeader,
  articleSlug
})=>{

  const [article, setArticle] = useState(null)

  useEffect(()=>{
    updateHeader(
      {
        translateY: 0 , 
        opacity: 1, 
        height: '0px' 
      }
    )
    getArticle()
  }, [])

  const getArticle = ()=>{
    graphql(ARTICLE, {
      domain: "dev",
      id: articleSlug,
      lang: "en",
    }, {
      success: (data)=>{
        setArticle(data.helpCenter.article)
      },
      error: ()=>{
        debugger
      }
    })
  }

  return (
    <Panel>
      {
        article && 
        <ContentWrapper>
          <h2>{article.title}</h2>

          <ThemeProvider 
            theme={ theme }>
              <DanteContainer>
                <DraftRenderer
                  raw={JSON.parse(article.content.serialized_content)}
                />
              </DanteContainer>
          </ThemeProvider>  

        </ContentWrapper>
      }

    </Panel>
  )
}

export default Article
