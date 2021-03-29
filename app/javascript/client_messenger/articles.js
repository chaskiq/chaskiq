import React, { useState } from 'react'
import styled from '@emotion/styled'
import {

  FadeBottomAnimation
} from './styles/styled'

import Moment from 'react-moment'

import { ThemeProvider } from 'emotion-theming'
import theme from './textEditor/theme'

import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import Loader from './loader'

import { Trans, withTranslation } from 'react-i18next'
import i18n from './i18n'

const DanteContainerExtend = styled(DanteContainer)`
  margin-top: 1.2em;
`

const Panel = styled.div`
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: scroll;
  width: 100%;
  height: 100%;
`

const ContentWrapper = styled.div`
  padding: 2em;
  ${(props) => FadeBottomAnimation(props)}
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

const Article = () => {
  const domain = window.domain
  const [article, _setArticle] = useState(window.articleJson)
  const [loading, _setLoading] = useState(false)
  //const { t } = useTranslation()

  function renderDate () {
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
        <ContentWrapper
        // in={transition}
        >

          { article.collection && <CollectionLabel>
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
              values={{ name: article.author.name }}
              components={[
                renderDate()
              ]}
            />

          </ArticleMeta>

          <ThemeProvider

            theme={ {
              ...theme,
              palette: {
                primary: '#121212',
                secondary: '#121212'
              }
            }
            }>
            <DanteContainerExtend>
              <DraftRenderer
                domain={domain}
                raw={article.serialized_content}
              />
            </DanteContainerExtend>
          </ThemeProvider>

        </ContentWrapper>
      }

    </Panel>
  )
}

const TranslatedArticle = withTranslation()(Article)
export default TranslatedArticle
