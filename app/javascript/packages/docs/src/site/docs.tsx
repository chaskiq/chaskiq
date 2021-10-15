import React from 'react';

import graphql from '@chaskiq/store/src/graphql/client';
import { ARTICLE_SETTINGS } from '@chaskiq/store/src/graphql/docsQueries';

import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import {
  LangGlobeIcon,
  LaunchIcon,
} from '@chaskiq/components/src/components/icons';
import danteTheme from '@chaskiq/components/src/components/textEditor/theme';

import Dropdown from './Dropdown';
import Article from './article';
import CollectionsWithSections from './collectionSections';
import Collections from './collections';
import CustomizedInputBase from './searchBar';

import { Facebook, Twitter, LinkedIn } from './icons';
import { Route, Switch, Link } from 'react-router-dom';
import { Global, css } from '@emotion/core';

const subdomain = window.location.host.split('.')[1]
  ? window.location.host.split('.')[0]
  : false;

function Docs(props) {
  // const classes = useStyles();
  const [settings, setSettings] = React.useState<any>({}) as any;
  const [lang, setLang] = React.useState(props.match.params.lang || 'en');
  const [error, _setError] = React.useState(false);
  const { history } = props;

  React.useEffect(() => {
    getSettings();
  }, [lang]);

  function getSettings() {
    graphql(
      ARTICLE_SETTINGS,
      {
        domain: subdomain,
        lang: props.match.params.lang,
      },
      {
        success: (data) => {
          setSettings(data.helpCenter);
        },
        error: () => {},
      }
    );
  }

  function handleLangChange(option) {
    setLang(option.id);
    history.push(`/${option.id}`);
  }

  const newDanteTheme = Object.assign({}, danteTheme, {
    mainColor: settings.color,
  });

  return (
    <div>
      <Global
        styles={css`
          a {
            color: ${settings.color} !important;
          }
        `}
      />

      <React.Fragment>
        <main>
          {/* Hero unit */}

          <div
            className="bg-black"
            // className={'classes.heroContent'}
            style={{
              backgroundImage: `url('${settings.headerImageLarge}')`,
              backgroundSize: 'cover',
            }}
          >
            <div className="lg:px-40 px-2">
              <div className="flex items-center justify-between py-2 md:mx-24 md:px-3">
                <div>
                  <Link to={`/${lang}`}>
                    <img src={settings.logo} className={'h-10 md:h-16'} />
                  </Link>
                </div>

                <div>
                  <div className={'flex items-center space-between'}>
                    <button
                      className={
                        'mr-2 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
                      }
                      color={'primary'}
                      onClick={(_e) => (window.location = settings.website)}
                    >
                      <LaunchIcon />
                      <span className={'ml-1'}>
                        {' Go to'} {settings.siteTitle}
                      </span>
                    </button>

                    <div>
                      <hr className={'classes.hr'} />
                    </div>

                    {settings.availableLanguages && (
                      <Dropdown
                        icon={
                          <LangGlobeIcon className="h-5 w-5 outline-none" />
                        }
                        filterHandler={handleLangChange}
                        options={settings.availableLanguages.map((o) => ({
                          name: o,
                          id: o,
                        }))}
                      />
                    )}
                  </div>
                </div>
              </div>

              {
                <Route
                  render={(props) => (
                    <CustomizedInputBase
                      lang={lang}
                      settings={settings}
                      {...props}
                      subdomain={subdomain}
                    />
                  )}
                ></Route>
              }
            </div>
          </div>

          {error ? <p>ERROR!</p> : null}

          <Switch>
            <Route
              exact
              path={`${props.match.url}/articles/:id`}
              render={(props) => (
                <Article
                  {...props}
                  lang={lang}
                  subdomain={subdomain}
                  theme={newDanteTheme}
                />
              )}
            />

            <Route
              exact
              path={`${props.match.url}/collections/:id`}
              render={(props) => (
                <CollectionsWithSections
                  {...props}
                  lang={lang}
                  subdomain={subdomain}
                />
              )}
            />

            <Route
              exact
              path={`${props.match.url}`}
              render={(props) => (
                <Collections {...props} lang={lang} subdomain={subdomain} />
              )}
            />
          </Switch>
        </main>

        {/* Footer */}

        <footer className={'py-8'}>
          {settings.siteTitle && (
            <p className="mt-2 leading-6 text-gray-500 text-center">
              {settings.siteTitle}
            </p>
          )}

          {settings.siteDescription && (
            <p className="mt-2 text-sm text-gray-400 text-center">
              {settings.siteDescription}
            </p>
          )}

          <div className="py-8 flex flex-row justify-evenly items-baseline text-gray-500">
            {settings.facebook && (
              <a href={`http://facebook.com/${settings.facebook}`}>
                <Facebook />
              </a>
            )}

            {settings.twitter && (
              <a href={`http://twitter.com/${settings.twitter}`}>
                <Twitter />
              </a>
            )}

            {settings.linkedin && (
              <a href={`http://instagram.com/${settings.linkedin}`}>
                <LinkedIn />
              </a>
            )}
          </div>

          <MadeWithLove />
        </footer>
        {/* End footer */}
      </React.Fragment>
    </div>
  );
}

function MadeWithLove() {
  return (
    <p className="text-center text-xs leading-5 text-gray-400">
      {'powered by '}
      <a href="https://chaskiq.io/">Chaskiq</a>
    </p>
  );
}

export default Docs;
