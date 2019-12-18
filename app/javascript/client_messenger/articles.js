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
import Loader from './loader'
import { useTranslation, Trans } from "react-i18next";

const DanteContainerExtend = styled(DanteContainer)`
  margin-top: 1.2em;
`

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
  margin-bottom: .3em;
  margin-top: .3em;
`

const CollectionLabel = styled.strong`
  border: 1px solid;
  padding: 5px;
`

const ArticleMeta = styled.span`
  margin-bottom: 1em;
`

const Article = ({
  updateHeader,
  articleSlug,
  transition,
  appData,
  i18n,
  graphqlClient,
  lang,
  domain
})=>{

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
    graphqlClient.send(ARTICLE, {
      domain: appData.articleSettings.subdomain,
      id: articleSlug,
      lang: lang,
    }, {
      success: (data)=>{
        setArticle(data.helpCenter.article)
        setLoading(false)
      },
      error: ()=>{
        setLoading(false)
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
        loading && <Loader sm />
      }
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
          <ArticleMeta>
            <Trans 
              i18nKey="article_meta"
              i18n={i18n}
              values={{name: article.author.name}}
              components={[
                renderDate()
              ]}
            />
          
          </ArticleMeta>

          <ThemeProvider 
            theme={ theme }>
              <DanteContainerExtend>
                <DraftRenderer
                  domain={domain}
                  raw={JSON.parse(article.content.serialized_content)}
                />
              </DanteContainerExtend>
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
