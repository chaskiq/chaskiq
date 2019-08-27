import React, {Component, useState, useEffect} from 'react'
import styled from '@emotion/styled'
import {
  AnchorButton,
  FadeRightAnimation,
  FadeBottomAnimation
} from './styles/styled'

import Moment from 'react-moment';


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
  height: 80%;
`

const ContentWrapper = styled.div`
  padding: 2em;
  ${(props)=> FadeBottomAnimation(props)}
`

const ArticleTitle = styled.h1`
  margin-bottom: .1em;
  margin-top: .3em;
`

const CollectionLabel = styled.strong`
  border: 1px solid;
  padding: 5px;
`

const Article = ({
  updateHeader,
  articleSlug,
  transition
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
        <ContentWrapper in={transition}>
          
          <CollectionLabel>
            {article.collection.title}
          </CollectionLabel>
          <ArticleTitle>
            {article.title}
          </ArticleTitle>
          <span>
            by:<strong>{article.author.name}</strong> on {" "}
            <Moment format="MMM Do, YYYY">
              {article.updatedAt}
            </Moment>
          </span>

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


const Articles = ({
  updateHeader,
  articleSlug,
  transition
})=>{

  return (

    
    <p> article list</p>

  )

}

export default Article
