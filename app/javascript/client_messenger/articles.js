import React, {Component, useState, useEffect} from 'react'
import styled from '@emotion/styled'
import {
  AnchorButton,
  FadeRightAnimation,
  FadeBottomAnimation
} from './styles/styled'

import Moment from 'react-moment';

import { ThemeProvider } from 'emotion-theming'
import theme from './textEditor/theme'
import themeDark from './textEditor/darkTheme'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import { useTranslation, Trans } from "react-i18next";


//import graphql from './graphql/client'
import {
  ARTICLE,
  SEARCH_ARTICLES
} from './graphql/queries'

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
  transition,
  appData,
  i18n,
  graphqlClient,
  lang
})=>{

  const [article, setArticle] = useState(null)
  const { t } = useTranslation();

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

  function getArticle(){
    graphqlClient.send(ARTICLE, {
      domain: appData.articleSettings.subdomain,
      id: articleSlug,
      lang: lang,
    }, {
      success: (data)=>{
        setArticle(data.helpCenter.article)
      },
      error: ()=>{
        debugger
      }
    })
  }

  function renderDate(){
    return <Moment format="MMM Do, YYYY">
            {article.updatedAt}
          </Moment>
  }

  return (
    <Panel>
      {
        article && 
        <ContentWrapper in={transition}>
          
          { article.collection &&  <CollectionLabel>
              {article.collection.title}
            </CollectionLabel>
          }
          <ArticleTitle>
            {article.title}
          </ArticleTitle>
          <span>
            <Trans 
              i18nKey="article_meta"
              i18n={i18n}
              values={{name: article.author.name}}
              components={[
                renderDate()
              ]}
            />
          
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
