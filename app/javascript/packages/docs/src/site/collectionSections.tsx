import React from 'react';

import Tooltip from 'rc-tooltip';

import graphql from '@chaskiq/store/src/graphql/client';
import { ARTICLE_COLLECTION_WITH_SECTIONS } from '@chaskiq/store/src/graphql/docsQueries';

import Breadcrumbs from '@chaskiq/components/src/components/Breadcrumbs';
import Avatar from '@chaskiq/components/src/components/Avatar';
import List from '@chaskiq/components/src/components/List';
import {
  ListItem,
  ListItemText,
} from '@chaskiq/components/src/components/List';

import translation from './translation';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

// interference poc
const OverlapAvatars = styled.div`
  margin-right: 1em;

  ul.avatars {
    display: flex; /* Causes LI items to display in row. */
    list-style-type: none;
    margin: auto; /* Centers vertically / horizontally in flex container. */
    padding: 0px 7px 0px 0px;
    z-index: 1; /* Sets up new stack-container. */
  }
  li.avatars__item {
    width: 24px; /* Forces flex items to be smaller than their contents. */
  }

  li.avatars__item:nth-of-type(1) {
    z-index: 9;
  }
  li.avatars__item:nth-of-type(2) {
    z-index: 8;
  }
  li.avatars__item:nth-of-type(3) {
    z-index: 7;
  }
  li.avatars__item:nth-of-type(4) {
    z-index: 6;
  }
  li.avatars__item:nth-of-type(5) {
    z-index: 5;
  }
  li.avatars__item:nth-of-type(6) {
    z-index: 4;
  }
  li.avatars__item:nth-of-type(7) {
    z-index: 3;
  }
  li.avatars__item:nth-of-type(8) {
    z-index: 2;
  }
  li.avatars__item:nth-of-type(9) {
    z-index: 1;
  }

  img.avatars__img,
  span.avatars__initials,
  span.avatars__others {
    background-color: #596376;
    border: 2px solid #1f2532;
    border-radius: 100px 100px 100px 100px;
    color: #ffffff;
    display: block;
    font-family: sans-serif;
    font-size: 12px;
    font-weight: 100;
    height: 33px;
    line-height: 29px;
    text-align: center;
    width: 33px;
  }
  span.avatars__others {
    background-color: #1e8fe1;
  }
`;

export default function CollectionsWithSections({ match, lang, subdomain }) {
  const [collections, setCollections] = React.useState(null);

  React.useEffect(() => {
    getArticles();
  }, [lang]);

  function getArticles() {
    graphql(
      ARTICLE_COLLECTION_WITH_SECTIONS,
      {
        domain: subdomain,
        id: match.params.id,
        lang: lang,
      },
      {
        success: (data) => {
          setCollections(data.helpCenter.collection);
        },
        error: () => {},
      }
    );
  }

  function renderArticles(article, section) {
    return (
      <ListItem divider key={`${section}-${article.id}`}>
        <ListItemText
          cols={1}
          primary={
            <div className="flex flex-col">
              <Link
                className="text-lg mb-2 leading-6 font-bold text-gray-900"
                color={'primary'}
                to={`/${lang}/articles/${article.slug}`}
              >
                {translation(article.title)}
              </Link>

              <div className="flex items-center">
                <Avatar
                  size="small"
                  alt={article.author.displayName}
                  src={article.author.avatarUrl}
                />
                <div className="space-y-1">
                  {article.author.displayName && (
                    <p className="ml-1.5 text-xs font-light text-gray-400">
                      Written by{' '}
                      <strong className="text-gray-800 font-semibold">
                        {article.author.displayName}
                      </strong>
                    </p>
                  )}
                  {article.updatedAt && (
                    <p className="ml-1.5 text-xs font-light text-gray-400">
                      Updated <Moment fromNow>{article.updatedAt}</Moment>
                    </p>
                  )}
                </div>
              </div>
            </div>
          }
          secondary={
            <p className="py-2 font-md text-gray-500 font-light">
              {article.description}
            </p>
          }
        />
      </ListItem>
    );
  }

  return (
    <div className="flex flex-row justify-center items-baseline bg-gray-100 py-8">
      {collections && (
        <div className="lg:w-3/4 w-full mx-3 md:mx-64">
          <Breadcrumbs
            aria-label="Breadcrumb"
            breadcrumbs={[
              { to: '/', title: 'Collections' },
              { title: translation(collections.title) },
            ]}
          ></Breadcrumbs>

          <div className="my-4 py-4 md:py-8 bg-gray-200 md:px-8 px-3 rounded-sm">
            <div>
              <p className="py-4 mt-2 text-2xl lg:text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-6xl sm:leading-10">
                {translation(collections.title)}
              </p>

              <p className="py-4 max-w-2xl text-xl leading-7 text-gray-500">
                {collections.description}
              </p>

              <div className="flex items-center justify-end">
                <OverlapAvatars>
                  <ul className="avatars">
                    {collections.authors &&
                      collections.authors.map((o) => {
                        return (
                          <li key={`authors-${o.id}`} className="avatars__item">
                            <Tooltip
                              placement="bottom"
                              overlay={o.display_name}
                            >
                              <Avatar alt={o.displayName} src={o.avatarUrl} />
                            </Tooltip>
                          </li>
                        );
                      })}

                    {collections.authors && collections.authors.length > 5 ? (
                      <li className="avatars__item">
                        <span className="avatars__others">+3</span>
                      </li>
                    ) : null}
                  </ul>
                </OverlapAvatars>

                {collections.baseArticles.length > 0 && (
                  <p className="max-w-2xl text-md leading-7 text-gray-500">
                    {collections.baseArticles.length} articles in this
                    collection
                  </p>
                )}
              </div>

              <div className="py-4">
                <List>
                  {collections.baseArticles.map((article) =>
                    renderArticles(article, 'articles-base')
                  )}
                </List>
              </div>

              {collections.sections.map((section) => (
                <div key={`sections-${section.id}`}>
                  <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
                    {translation(section.title)}
                  </p>

                  <p className="mt-2 mb-4 text-md leading-7 text-gray-500 lg:mx-auto">
                    {section.articles.length} articles in this section
                  </p>

                  {section.articles.length > 0 ? (
                    <div>
                      <List>
                        {section.articles.map((article) =>
                          renderArticles(article, 'section-articles')
                        )}
                      </List>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
