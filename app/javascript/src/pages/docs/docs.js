import React from 'react'
import graphql from '../../graphql/client'
import {
  ARTICLE_SETTINGS
} from '../../graphql/docsQueries'

import CustomizedInputBase from './searchBar'
import danteTheme from '../../components/textEditor/theme'

import Article from './article'
import CollectionsWithSections from './collectionSections'
import Button from '../../components/Button'
import Collections from './collections'
import FilterMenu from '../../components/FilterMenu'

import { LangGlobeIcon, LaunchIcon } from '../../components/icons'

import { Facebook, Twitter, LinkedIn } from './icons'

import {

  Route,
  Switch,
  Link
} from 'react-router-dom'
import { Global, css } from '@emotion/core'

const subdomain = window.location.host.split('.')[1]
  ? window.location.host.split('.')[0]
  : false

function Docs (props) {
  // const classes = useStyles();
  const [settings, setSettings] = React.useState({})
  const [lang, setLang] = React.useState(props.match.params.lang || 'en')
  const [error, _setError] = React.useState(false)
  const { history } = props

  React.useEffect(() => {
    getSettings()
  }, [lang])

  function getSettings () {
    graphql(
      ARTICLE_SETTINGS,
      {
        domain: subdomain,
        lang: props.match.params.lang
      },
      {
        success: (data) => {
          setSettings(data.helpCenter)
        },
        error: () => {}
      }
    )
  }

  function handleLangChange (option) {
    setLang(option.id)
    history.push(`/${option.id}`)
  }

  const newDanteTheme = Object.assign({}, danteTheme, {
    mainColor: settings.color
  })

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
              backgroundImage: `url('${settings.headerImageLarge}')`
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
                    <Button
                      variant="outlined-transparent"
                      className={'mr-2'}
                      color={'primary'}
                      onClick={(_e) => (window.location = settings.website)}
                    >
                      <LaunchIcon />
                      {' Go to'} {settings.siteTitle}
                    </Button>

                    <div>
                      <hr className={'classes.hr'} />
                    </div>

                    {settings.availableLanguages && (
                      <FilterMenu
                        icon={LangGlobeIcon}
                        options={settings.availableLanguages.map((o) => ({
                          name: o,
                          id: o
                        }))}
                        value={lang}
                        filterHandler={handleLangChange}
                        buttonVariant={"outlined-transparent"}
                        position={'right'}
                        // triggerButton={this.toggleButton}
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
          {
            settings.siteTitle &&
            <p className="mt-2 leading-6 text-gray-500 text-center">
              {settings.siteTitle}
            </p>
          }

          {
            settings.siteDescription &&
            <p className="mt-2 text-sm text-gray-400 text-center">
              {settings.siteDescription}
            </p>
          }

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
  )
}

function MadeWithLove () {
  return (
    <p className="text-center text-xs leading-5 text-gray-400">
      {'powered by '}
      <a href="https://chaskiq.io/">Chaskiq</a>
    </p>
  )
}

export default Docs
