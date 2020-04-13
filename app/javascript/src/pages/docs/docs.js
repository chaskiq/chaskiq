import React from 'react'
import graphql from '../../graphql/client'
import {
  ARTICLE_SETTINGS,
  ARTICLE_COLLECTION_WITH_SECTIONS,
  ARTICLE_COLLECTIONS,
  ARTICLE,
  SEARCH_ARTICLES
} from '../../graphql/docsQueries'

import CustomizedInputBase from './searchBar'
import danteTheme from '../../components/textEditor/theme'
import Container from '../../components/Content'
import Article from './article'
import CollectionsWithSections from './collectionSections'
import Button from '../../components/Button'
import Collections from './collections'
import FilterMenu from '../../components/FilterMenu'

import {
  LangGlobeIcon,
  LaunchIcon
} from '../../components/icons'

import {
  Facebook,
  Twitter,
  LinkedIn
} from './icons'


import {
  BrowserRouter,
  Route,
  Switch,
  Link,
  withRouter
} from 'react-router-dom'
import { Global, css } from '@emotion/core'

const subdomain = window.location.host.split('.')[1] ?
 window.location.host.split('.')[0] : 
 false;

function Docs(props) {
  //const classes = useStyles();
  const [settings, setSettings] = React.useState({})
  const [lang, setLang] = React.useState(props.match.params.lang || 'en')
  const [error, setError] = React.useState(false)

  const {history} = props

  /*
  let theme = createMuiTheme({

    p: {
      //font-family: 'IBM Plex Sans', sans-serif;
      //font-family: 'IBM Plex Sans Condensed', sans-serif;
      //fontFamily: "\"IBM Plex Sans\", \"Helvetica\", \"Arial\", sans-serif",
      fontFamily: "\"IBM Plex Sans\", \"Helvetica\", \"Arial\", sans-serif",
      //fontFamily: "\"Roboto Mono\", \"Helvetica\", \"Arial\", sans-serif",
      fontSize: 14,
  
      h5: {
        //fontFamily: "\"IBM Plex Sans Condensed\", \"Helvetica\", \"Arial\", sans-serif",
        fontFamily: "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
        fontWeight: 'bold',
        fontSize: 26,
        letterSpacing: 0.5,
      },
  
      h4: {
        fontFamily: "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
        fontWeight: 'bold',
        fontSize: '2.5em',
        letterSpacing: 0.5,
      },
  
      h3: {
        fontFamily: "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
        fontWeight: 'bold',
        fontSize: '2.8em',
        letterSpacing: 0.5,
      },

      subtitle1: {
        fontSize: '1rem',
        fontFamily: "\"IBM Plex Sans\", \"Helvetica\", \"Arial\", sans-serif",
        //fontFamily: '"Roboto Mono", "Helvetica", "Arial", sans-serif',
        fontWeight: '400',
        lineHeight: '1.75',
      }
    },
    palette: {
      background: {
        paper: "#fefefe"
      },
      primary: {
        light: settings.color,
        //main: '#009be5',
        //main: '#444',
        //main: '#dc18c1',
        main: settings.color || '#fff',
        white: '#fff',
        dark: '#15501a', //'#006db3',
      }
    },
    shape: {
      borderRadius: 3,
    },
  });
  
  theme = {
    ...theme,
    overrides: {
      MuiDrawer: {
        paper: {
          //backgroundColor: '#18202c',
          backgroundColor: '#f8f8f8',
        },
      },
      MuiButton: {
        label: {
          textTransform: 'none',
        },
        contained: {
          divShadow: 'none',
          '&:active': {
            divShadow: 'none',
          },
        },
      },
      MuiTabs: {
        root: {
          marginLeft: theme.spacing(1),
        },
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: theme.palette.common.white,
        },
      },
      MuiTab: {
        root: {
          textTransform: 'none',
          margin: '0 16px',
          minWidth: 0,
          padding: 0,
          [theme.breakpoints.up('md')]: {
            padding: 0,
            minWidth: 0,
          },
        },
      },
      MuiIconButton: {
        root: {
          padding: theme.spacing(1),
        },
      },
      MuiTooltip: {
        tooltip: {
          borderRadius: 4,
        },
      },
      MuiDivider: {
        root: {
          backgroundColor: "#ccc", //#404854',
        },
      },
      MuiListItemText: {
        primary: {
          fontWeight: theme.p.fontWeightMedium,
        },
      },
      MuiListItemAvatar: {
        root: {
          marginRight: '.5em',
          minWidth: '30px'
        }
      },
      MuiListItemIcon: {
        root: {
          color: 'inherit',
          marginRight: 0,
          '& svg': {
            fontSize: 20,
          },
        },
      },
      MuiAvatar: {
        root: {
          width: 32,
          height: 32,
        },
      },
      MuiBreadcrumbs: {
        root: {
          color: "#ccc"
        }
      },
    },
    props: {
      MuiTab: {
        disableRipple: true,
      },
    },
    mixins: {
      ...theme.mixins,
      toolbar: {
        minHeight: 48,
      },
    },
  };*/

  React.useEffect(() => {
    getSettings()
  }, [lang])

  
  function getSettings(){
    graphql(ARTICLE_SETTINGS, {
      domain: subdomain,
      lang: props.match.params.lang
    }, {
      success: (data)=>{
        setSettings(data.helpCenter)
      },
      error: ()=>{

      }
    })
  }

  function handleLangChange(option){
    setLang(option.id)
    history.push(`/${option.id}`)
  }

  const newDanteTheme = Object.assign({}, 
    danteTheme, {mainColor: settings.color})

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
            //className={'classes.heroContent'} 
            style={{
            backgroundImage: `url('${settings.headerImageLarge}')`,
          }}>

            <div className="px-40" >

              <div 
                className="flex items-center justify-between py-2">
                  
                <div>

                  <Link to={`/${lang}`}>
                    <img 
                      src={settings.logo} 
                      className={'classes.logoImage'}
                    />
                  </Link>
                </div>

                <div>

                  <div className={'flex items-center space-between'}>

                    <Button
                      variant="outlined"
                      className={'mr-2'} 
                      color={'primary'}
                      onClick={(e)=> window.location = settings.website}>
                      <LaunchIcon/>
                      {" Go to"} {settings.siteTitle}
                    </Button>

                    <div ml={1}>
                      <hr className={'classes.hr'} />
                    </div>
                    
                    {
                      settings.availableLanguages &&
                      <FilterMenu 
                        icon={
                          LangGlobeIcon
                        }
                        options={
                          settings.availableLanguages.map(
                            (o)=> ({
                              name: o,
                              id: o
                            }) 
                        )}
                        value={lang}
                        filterHandler={handleLangChange}
                        //triggerButton={this.toggleButton}
                      />
                    }
                  </div>  
                </div>

              </div>
                <p className={'py-6 text-center text-5xl leading-9 font-extrabold text-gray-100'}>
                  {settings.siteDescription}
                </p>
              
                { <Route render={(props)=>(
                  <CustomizedInputBase 
                    lang={lang} 
                    {...props}
                    subdomain={subdomain}
                  />
                )}></Route> }
            </div>
          
          </div>

          {
            error ?
            <p>ERROR!</p> : null
          }

          
          <Switch>

              <Route exact path={`${props.match.url}/articles/:id`} render={(props)=>(
                <Article {...props} 
                  lang={lang} 
                  subdomain={subdomain}
                  theme={newDanteTheme} 
                />
              )}/>

              <Route exact path={`${props.match.url}/collections/:id`} render={(props)=>(
                <CollectionsWithSections 
                  {...props} 
                  lang={lang}
                  subdomain={subdomain}
                />
              )}/>

              <Route exact path={`${props.match.url}`} render={(props)=>(
                <Collections 
                  {...props} 
                  lang={lang} 
                  subdomain={subdomain}
                />
              )}
              />
              
          </Switch>
              
        
        </main> 


        {/* Footer */}

        <footer className={'py-8'}>

          <p className="mt-2 text-base leading-6 text-gray-500 text-center">
            Chaskiq
          </p>

          <div
            className="py-8 flex flex-row justify-evenly items-baseline text-gray-500">
            {
              settings.facebook &&
              <a href={`http://facebook.com/${settings.facebook}`}>
                <Facebook/>
              </a>
            }
            
            {
              settings.twitter &&
              <a href={`http://twitter.com/${settings.twitter}`}>
                <Twitter/>
              </a> 
            }
            
            {
              settings.linkedin &&
                <a href={`http://instagram.com/${settings.linkedin}`}>
                  <LinkedIn/>
                </a> 
            }

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
    <p className="text-center text-sm leading-5 text-gray-500">
      {'powered by '}
      <a href="https://chaskiq.io/">
        Chaskiq
      </a>
      {' team.'}
    </p>
  );
}

export default Docs
