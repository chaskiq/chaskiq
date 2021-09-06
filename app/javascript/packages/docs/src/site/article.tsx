import React from 'react';
import Moment from 'react-moment';
import styled from '@emotion/styled';

import translation from './translation';
import { ThemeProvider } from 'emotion-theming';
import EditorContainer from 'Dante2/package/esm/editor/styled/base';

import graphql from '@chaskiq/store/src/graphql/client';
import { ARTICLE } from '@chaskiq/store/src/graphql/docsQueries';

import Breadcrumbs from '@chaskiq/components/src/components/Breadcrumbs';
import Avatar from '@chaskiq/components/src/components/Avatar';
import DraftRenderer from '@chaskiq/components/src/components/textEditor/draftRenderer';

import { withRouter } from 'react-router-dom';

const NewEditorStyles = styled(EditorContainer)<{
  theme: any;
}>`
  font-size: 1.3em;

  white-space: pre-wrap; /* CSS3 */
  white-space: -moz-pre-wrap; /* Firefox */
  white-space: -pre-wrap; /* Opera <7 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* IE */

  a {
    color: ${(props) => props.theme.mainColor};
  }
`;

type ArticleProps = {
  lang: string;
  theme: any;
  subdomain: string;
  match: any;
  article: any;
  location: any;
};
function Article(props: ArticleProps) {
  const [article, setArticle] = React.useState(null);
  const { lang, theme, subdomain, location } = props;
  React.useEffect(() => {
    getArticle();
  }, []);

  React.useEffect(() => {
    setArticle(null);
    getArticle();
  }, [location.key]);

  function getArticle() {
    graphql(
      ARTICLE,
      {
        domain: subdomain,
        id: props.match.params.id,
        lang: lang,
      },
      {
        success: (data) => {
          setArticle(data.helpCenter.article);
        },
        error: (_e) => {},
      }
    );
  }

  return (
    <div className="flex flex-row items-center justify-center bg-gray-100">
      <div
        className="w-full rounded shadow lg:p-12
        m-2 lg:mx-64 px-2 lg:w-10/12 bg-white p-2"
      >
        {article ? (
          <div className={'text-xs lg:text-sm'}>
            <Breadcrumbs
              aria-label="Breadcrumb"
              breadcrumbs={[
                { to: `/${lang}`, title: 'Collections' },
                {
                  to: `/${lang}/collections/${article.collection.slug}`,
                  title: translation(article.collection.title),
                },
                { title: translation(article.title) },
              ]}
            />

            <div className="py-4">
              <hr />
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

                <div className={'ml-2'}>
                  {article.author.name && (
                    <p className="text-md leading-6 font-light text-gray-900">
                      Written by{' '}
                      <span className="font-semibold">
                        {article.author.name}
                      </span>
                    </p>
                  )}

                  <p className="text-md leading-6 font-light text-gray-500">
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
  );
}

export default withRouter(Article);
