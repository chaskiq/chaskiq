import React from 'react'
import graphql from '../../graphql/client'
import {

  ARTICLE
} from '../../graphql/docsQueries'

import translation from './translation'
import { ThemeProvider } from 'emotion-theming'
import DraftRenderer from '../../components/textEditor/draftRenderer'
import EditorStyles from 'Dante2/package/es/styled/base'

import Breadcrumbs from '../../components/Breadcrumbs'
import Avatar from '../../components/Avatar'
import Moment from 'react-moment'
import styled from '@emotion/styled'

const NewEditorStyles = styled(EditorStyles)`
  font-size: 1.3em;

  white-space: pre-wrap; /* CSS3 */
  white-space: -moz-pre-wrap; /* Firefox */
  white-space: -pre-wrap; /* Opera <7 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* IE */

  a {
    color: ${(props) => props.theme.mainColor};
  }
`

export default function Article (props) {
  const [article, setArticle] = React.useState(null)
  const { lang, theme } = props

  const { subdomain } = props

  React.useEffect(() => {
    getArticle()
  }, [])

  function getArticle () {
    graphql(
      ARTICLE,
      {
        domain: subdomain,
        id: props.match.params.id,
        lang: lang
      },
      {
        success: (data) => {
          setArticle(data.helpCenter.article)
        },
        error: (_e) => {
        }
      }
    )
  }

  return (
    <div className="flex flex-row items-center justify-center bg-gray-100">
      <div className="w-full rounded shadow lg:p-12
        m-2 lg:mx-64 px-2 lg:w-10/12 bg-white p-2">
        {article ? (
          <div className={'text-xs lg:text-sm'}>
            <Breadcrumbs
              aria-label="Breadcrumb"
              breadcrumbs={[
                { to: `/${lang}`, title: 'Collections' },
                {
                  to: `/${lang}/collections/${article.collection.slug}`,
                  title: translation(article.collection.title)
                },
                { title: translation(article.title) }
              ]}
            />

            <div className="py-4">
              <hr variant="middle" />
            </div>

            <div className="p-4">
              <p className="py-4 mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-5xl sm:leading-10">
                {translation(article.title)}
              </p>

              <div className="flex flex-row items-center py-2">
                <Avatar
                  size={'medium'}
                  alt={article.author.name}
                  src={article.author.avatarUrl}
                />

                <div className={'ml-4'}>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    Written by {article.author.name}
                  </p>

                  <p className="text-base leading-6 text-gray-500">
                    {'updated '}
                    <Moment fromNow>{article.updatedAt}</Moment>
                  </p>
                </div>
              </div>
            </div>

            <ThemeProvider theme={theme}>
              <NewEditorStyles>
                <DraftRenderer
                  raw={JSON.parse(article.content.serialized_content)}
                />
              </NewEditorStyles>
            </ThemeProvider>
          </div>
        ) : null}
      </div>
    </div>
  )
}
