import React from 'react';

import {
  AppBar,
  Button,
  CameraIcon,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CssBaseline,
  Grid,
  Toolbar,
  Tooltip,
  Typography,
  Link,
  Container,
  Paper,
  InputBase,
  Divider,
  IconButton,
  Breadcrumbs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Menu,
  MenuItem
} from '@material-ui/core';

import LanguageIcon from '@material-ui/icons/Language';

import { makeStyles, withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import LaunchIcon from '@material-ui/icons/Launch';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

import gravatar from "../../shared/gravatar"

import DanteArticle from './showArticle'

import styled from 'styled-components'
import {Facebook, Twitter, LinkedIn} from './icons'
import {
  BrowserRouter,
  Route,
  Switch,
  Link as RouterLink
} from 'react-router-dom'

import graphql from '../../graphql/client'
import {
  ARTICLE_SETTINGS,
  ARTICLE_COLLECTION_WITH_SECTIONS,
  ARTICLE_COLLECTIONS,
  ARTICLE
} from '../../graphql/docsQueries'

const BlockContent = styled.div`
  display: flex;
  justify-content: center;
`

const OverlapAvatars = styled.div`

  margin-right: 1em;

  ul.avatars {
    display: flex ; /* Causes LI items to display in row. */
    list-style-type: none ;
    margin: auto ; /* Centers vertically / horizontally in flex container. */
    padding: 0px 7px 0px 0px ;
    z-index: 1 ; /* Sets up new stack-container. */
  }
  li.avatars__item {
    width: 24px ; /* Forces flex items to be smaller than their contents. */
  }

  li.avatars__item:nth-child( 1 ) { z-index: 9 ; }
  li.avatars__item:nth-child( 2 ) { z-index: 8 ; }
  li.avatars__item:nth-child( 3 ) { z-index: 7 ; }
  li.avatars__item:nth-child( 4 ) { z-index: 6 ; }
  li.avatars__item:nth-child( 5 ) { z-index: 5 ; }
  li.avatars__item:nth-child( 6 ) { z-index: 4 ; }
  li.avatars__item:nth-child( 7 ) { z-index: 3 ; }
  li.avatars__item:nth-child( 8 ) { z-index: 2 ; }
  li.avatars__item:nth-child( 9 ) { z-index: 1 ; }

  img.avatars__img,
  span.avatars__initials,
  span.avatars__others {
    background-color: #596376 ;
    border: 2px solid #1F2532 ;
    border-radius: 100px 100px 100px 100px ;
    color: #FFFFFF ;
    display: block ;
    font-family: sans-serif ;
    font-size: 12px;
    font-weight: 100;
    height: 33px;
    line-height: 29px;
    text-align: center;
    width: 33px;
  }
  span.avatars__others {
    background-color: #1E8FE1 ;
  }

`

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
};


function MadeWithLove() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Built with love by the '}
      <Link href="https://chaskiq.io/">
        Chaskiq
      </Link>
      {' team.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3.5, 0, 3),
    //background-attachment: local;
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },

  root: {
    //width: '100%',
    display: 'flex',
    padding: '10px 6px',
    alignItems: 'center',
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
  articlePaper: {
    margin: theme.spacing(8, 0, 6),
    padding: theme.spacing(2),
  },
  textPrimary: {
    fontSize: '2em',
    color: "#efe",
    margin: theme.spacing(2, 0, 2),
    display: 'inline-block'
  },
  logoImage: {
    //width: '150px',
    height: '73px'
  },
  siteLink: {
    color: "#efe",
    display: 'flex'
  },
  routeLink: {
    color: theme.palette.primary.main
  },
  articleLink: {
    color: theme.palette.primary.main,
    fontSize: '1.5em',
    fontFamily: theme.typography.h5.fontFamily,
    fontWeight: 'bold'
  },
  floorPaper:{
    background: '#eaecec',
    padding: theme.spacing(4)
  },
  breadCrumbs: {
    margin: theme.spacing(1.6, 0, 1.6, 0)
  },
  authorContainer: {
    margin: theme.spacing(1, 0, 0, 0),
    color: '#ccc',
  },

  breacrumbLink:{
    color: theme.palette.primary.main
  },

  collectionMeta: {
    margin: theme.spacing(1, 0, 2, 0)
  },

  headerText: {
    color: theme.palette.primary.main
  }


}));

const subdomain = window.location.host.split('.')[1] ? window.location.host.split('.')[0] : false;

//const LinkRouter = props => <Link {...props} component={RouterLink} />;

const LinkRouter = React.forwardRef((props, ref) => (
  <RouterLink innerRef={ref} 
    to={props.to} 
    {...props} 
  />
));



function CustomizedInputBase() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <IconButton className={classes.iconButton} aria-label="Menu">
        <MenuIcon />
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder="Search here"
        inputProps={{ 'aria-label': 'Search here' }}
      />
      <IconButton className={classes.iconButton} aria-label="Search">
        <SearchIcon />
      </IconButton>
      <Divider className={classes.divider} />
      <IconButton color="primary" className={classes.iconButton} aria-label="Directions">
        <DirectionsIcon />
      </IconButton>
    </Paper>
  );
}

export default function Docs() {
  const classes = useStyles();

  const [settings, setSettings] = React.useState({})

  const [error, setError] = React.useState(false)

  let theme = createMuiTheme({

    typography: {
      //font-family: 'IBM Plex Sans', sans-serif;
      //font-family: 'IBM Plex Sans Condensed', sans-serif;
      //fontFamily: "\"IBM Plex Sans\", \"Helvetica\", \"Arial\", sans-serif",
  
      fontFamily: "\"Roboto Mono\", \"Helvetica\", \"Arial\", sans-serif",
      fontSize: 14,
      /*fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,*/
  
  
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
    },
    palette: {
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
          boxShadow: 'none',
          '&:active': {
            boxShadow: 'none',
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
          fontWeight: theme.typography.fontWeightMedium,
        },
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
      }
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
  };

  React.useEffect(() => {
    getSettings()
  }, [])

  
  function getSettings(){
    graphql(ARTICLE_SETTINGS, {
      domain: subdomain
    }, {
      success: (data)=>{
        setSettings(data.helpCenter)
      },
      error: ()=>{

      }
    })
  }

  return (
    <div>
    
    
    
    <MuiThemeProvider theme={theme}>
        <CssBaseline />
        
        {/*<AppBar position="relative">
          <Toolbar>
            <CameraIcon className={classes.icon} />
            <Typography variant="h6" className={classes.breacrumbLink} noWrap>
              Help Center
            </Typography>
          </Toolbar>
          </AppBar>*/}

            <main>
              {/* Hero unit */}

              <div className={classes.heroContent} 
                style={{
                backgroundImage: `url('${settings.headerImageLarge}')`,
              }}>

                <Container maxWidth="md">

                  <Grid 
                    //alignItems={} 
                    container
                    //justifyContent={'space-between'}
                    alignItems={'center'}
                    //justifyItems={"self-start"}
                    justify={'space-between'}>
                      
                    <Grid item>
                      <img src={settings.logo} className={classes.logoImage}/>
                    </Grid>

                    <Grid item>

                      <Grid 
                        //alignItems={} 
                        container
                        //justifyContent={'space-between'}
                        alignItems={'center'}
                        //justifyItems={"self-start"}
                        justify={'space-between'}>

                        <Link
                          className={classes.siteLink} 
                          color={'primary'}
                          onClick={(e)=> window.location = settings.website}>
                          <LaunchIcon/>
                          <Typography className={classes.siteLink} >
                            {" Go to"} {settings.siteTitle}
                          </Typography>
                        </Link>
                
                        {
                          settings.availableLanguages ? 
                          <LongMenu languages={settings.availableLanguages}/> : null
                        }
                      </Grid>  
                    </Grid>




                  </Grid>

                  
                  
                    <Typography 
                      //variant="subtitle1" 
                      align="center" 
                      color="textPrimary"
                      className={classes.textPrimary}
                      gutterBottom>
                      {settings.siteDescription}
                    </Typography>
                  

                    { CustomizedInputBase() }

                  { /*settings.siteDescription ? 
                    <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
                      {settings.siteDescription}
                    </Typography> : null
                  */}

                  {
                    /* 
                      <div className={classes.heroButtons}>
                        <Grid container spacing={2} justify="center">
                          <Grid item>
                            <Button variant="contained" color="primary">
                              Main call to action
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button variant="outlined" color="primary">
                              Secondary action
                            </Button>
                          </Grid>
                        </Grid>
                      </div>
                    */
                  }
                
                </Container>
              
              </div>

              {
                error ?
                <p>ERROR!</p> : null
              }

              <BrowserRouter>
                <Switch>

                    <Route exact path={`/:id`} render={(props)=>(
                      <Article {...props} />
                    )}/>

                    <Route exact path={`/articles/:id`} render={(props)=>(
                      <Article {...props} />
                    )}/>

                    <Route exact path={`/collections/:id`} render={(props)=>(
                      <CollectionsWithSections {...props} />
                    )}/>

                    <Route exact path={`/`} render={(props)=>(
                      <Collections />
                    )}
                    />
                    
                </Switch>
              </BrowserRouter>       
            
            </main> 
        

        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Chaskiq
          </Typography>

          <Grid
            container
            direction="row"
            justify="space-evenly"
            alignItems="baseline"

          >
            <Link href={`http://facebook.com/${settings.facebook}`}>
              <Facebook/>
            </Link>

            <Link href={`http://twitter.com/${settings.twitter}`}>
              <Twitter/>
            </Link>

            <Link href={`http://instagram.com/${settings.linkedin}`}>
              <LinkedIn/>
            </Link>

          </Grid>
             
          <Box mt={2}>
            <MadeWithLove />
          </Box>            
          
        </footer>
        {/* End footer */}
        </MuiThemeProvider>
       
      
    </div>
    
  );
}

function Article(props){
  const [article, setArticle] = React.useState(null)
  const classes = useStyles();

  React.useEffect(()=>{
    getArticle()
  }, [])

  function getArticle(){
    graphql(ARTICLE, {
      domain: subdomain,
      id: props.match.params.id
    }, {
      success: (data)=>{
        setArticle(data.helpCenter.article)
      },
      error: (e)=>{
        debugger
      }
    })
  }

  return (

    <Grid
      container
      direction="row"
      justify="center"
      alignItems="baseline"
    >
      <Grid item xs={12} sm={8}>

        {
          article ? 
          <Paper className={classes.articlePaper}>


            <Breadcrumbs aria-label="Breadcrumb">
          
              <LinkRouter className={classes.breacrumbLink} to="/">
                Articles
              </LinkRouter>

              {
                article.collection ?
                  <LinkRouter className={classes.breacrumbLink} to={`/collections/${article.collection.slug}`}>
                    {article.collection.title}
                  </LinkRouter> : null 
              }
      
              <Typography>
                  {article.title}
              </Typography>
    
            </Breadcrumbs>


            <Box mt={2}>
              <Divider variant="middle"/>
            </Box>

            <Box mt={3} mb={3}>
              <Typography variant="h3" gutterBottom>
                {article.title}
              </Typography>
            </Box>

            <Box m={2}>
              <DanteArticle article={article} />
            </Box>
            
            
          </Paper> : null 
        }
      </Grid>
      
    </Grid>

  )
}


function Collections(props){
  const classes = useStyles();

  const [collections, setCollections] = React.useState([])

  React.useEffect(() => {
    getArticles()
  }, [])

  function getArticles(){
    graphql(ARTICLE_COLLECTIONS, {
      domain: subdomain
    }, {
      success: (data)=>{
        setCollections(data.helpCenter.collections)
        if(!data.helpCenter.collections)
          setError("not_found")
      },
      error: ()=>{

      }
    })
  }

  function truncateOnWord(str, num) {
    if (str.length > num) {
      return str.slice(0, num) + "...";
    } else {
      return str;
    }
  }

  return (
    <Container className={classes.cardGrid} maxWidth="md">
                  {/* End hero unit */}
                  <Grid container spacing={4}>
                    {collections.map(card => (
                      <Grid item key={card.id} xs={12} sm={12} md={4}>
                        <Card className={classes.card}>

                          {/*
                            <RouterLink 
                                className={classes.routeLink}
                                color={'primary'}
                                to={`/collections/${card.slug}`}> 
                                
                                <CardMedia
                                  className={classes.cardMedia}
                                  image="https://source.unsplash.com/random"
                                  title="Image title"
                                />
                            </RouterLink> 
                          */}

                          <CardContent className={classes.cardContent}>
                            
                            <RouterLink 
                              className={classes.routeLink}
                              color={'primary'}
                              to={`/collections/${card.slug}`}> 
                              
                              <Typography gutterBottom variant="h5" component="h3">
                                {card.title}
                              </Typography>

                            </RouterLink>

                            <Typography>
                              {truncateOnWord(card.description, 120)}
                            </Typography>

                          </CardContent>
                      
                          {/*
                            <CardActions>
                            <Button size="small" color="primary">
                              View
                            </Button>
                            <Button size="small" color="primary">
                              Edit
                            </Button>
                          </CardActions>
                          */}

                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                </Container>
  )

}

function CollectionsWithSections({match}){

  const classes = useStyles();

  const [collections, setCollections] = React.useState(null)

  React.useEffect(() => {
    getArticles()
  }, [])

  function getArticles(){
    graphql(ARTICLE_COLLECTION_WITH_SECTIONS, {
      domain: subdomain,
      id: match.params.id
    },
    {
      success: (data)=>{
        setCollections(data.helpCenter.collection)
      },
      error: ()=>{
        
      }
    })
  }

  return(
    
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="baseline"
        spacing={5}
      >

        
          {
            collections ? 
          
            <Grid item xs="12" sm="8">

              <Breadcrumbs className={classes.breadCrumbs}  
                aria-label="Breadcrumb">
                  
                <LinkRouter className={classes.breacrumbLink} to="/">
                  Collections
                </LinkRouter>

                <Typography>
                  {collections.title}
                </Typography>

              </Breadcrumbs>

              <Paper spacing={5} 
                elevation={0}
                className={classes.floorPaper}>

                <Typography variant="h3" gutterBottom gutterTop>
                  {collections.title}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  {collections.description}
                </Typography>

                <Divider/>

                <Grid container alignItems={'center'} gutterTop className={classes.collectionMeta}>

                  <OverlapAvatars>
                    <ul className="avatars">

                      {
                        collections.meta.authors.map((o)=>{
                          return <li key={`authors-${o.id}`} className="avatars__item">
                                  <Tooltip title={o.display_name}>
                                    <Avatar
                                      alt={o.email}
                                      src={gravatar(o.email)}
                                    />
                                  </Tooltip>
                                </li>
                        })
                      }

                      {
                        collections.meta.authors.length > 5 ?
                          <li className="avatars__item">
                            <span className="avatars__others">+3</span>
                          </li> : null
                      }
                    
                    </ul>
                  </OverlapAvatars> 
                
                  <Typography variant="subtitle1" gutterBottom>
                    {collections.meta.size} articles in this collection
                  </Typography>

                </Grid>

                <Paper>
                  {
                    collections.baseArticles.map((article)=>(
                      <ListItem divider key={`articles-${article.id}`}>
                        <ListItemText primary={
                          <div>
                            <RouterLink 
                              className={classes.articleLink}
                              color={'primary'}
                              to={`/articles/${article.slug}`}>
                              {article.title}
                            </RouterLink>

                            <Grid container
                            className={classes.authorContainer} 
                            alignItems={'center'}
                          >
                            <ListItemAvatar>
                              <Avatar
                                alt={article.author.email}
                                src={gravatar(article.author.email)}
                              />
                            </ListItemAvatar>

                            <Typography variant={"subtitle1"}>
                              written by <strong>{article.author.displayName}</strong>
                            </Typography>
                          </Grid>
                          </div>
                        }/>
                      </ListItem>
                    ))
                  }
                </Paper>

                {
                  collections.sections.map((section)=>(
                    <div key={`sections-${section.id}`} style={{marginTop: '2em'}}>

                      <Typography variant="h4" gutterBottom>
                        {section.title}
                      </Typography>

                      <Typography variant="subtitle1" gutterBottom>
                        {section.articles.length} articles in this collection
                      </Typography>

                      <Paper>

                        <List>
                          {
                            section.articles.map((article)=>(
                                <ListItem divider key={`section-article-${article.id}`}>
                                  <ListItemText 
                                    primary={<div>
                                      <RouterLink 
                                        color={'primary'}
                                        className={classes.articleLink}
                                        to={`/articles/${article.slug}`}>
                                        {article.title}
                                      </RouterLink>
                                      
                                      <Grid container
                                        className={classes.authorContainer} 
                                        alignItems={'center'}
                                      >
                                        <ListItemAvatar>
                                          <Avatar
                                            alt={article.author.displayName}
                                            src={gravatar(article.author.email)}
                                          />
                                        </ListItemAvatar>

                                        <Typography variant={"subtitle1"}>
                                          written by <strong>{article.author.displayName}</strong>
                                        </Typography>
                                      </Grid>

                                    </div>
                                  }
                                    secondary={article.description}
                                  />
                                </ListItem>
                            ))
                          }
                        </List>
                      
                      </Paper>
                    
                    </div>
                  ))
                }
              </Paper>
            
            </Grid> : null

          }
      
      </Grid>
    
  )
}

const ITEM_HEIGHT = 48;

function LongMenu({languages}) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        className={classes.siteLink}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: 200,
          },
        }}
      >
        {languages.map(option => (
          <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}