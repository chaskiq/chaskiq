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
} from '@material-ui/core';


import { makeStyles } from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

import DanteArticle from './showArticle'

import styled from 'styled-components'

import {
  BrowserRouter,
  Route,
  Switch,
  Link as RouterLink
} from 'react-router-dom'

import graphql from '../../graphql/client'
import {
  ARTICLE_COLLECTION_WITH_SECTIONS,
  ARTICLE_COLLECTIONS,
  ARTICLE
} from '../../graphql/docsQueries'


const BlockContent = styled.div`
  display: flex;
  justify-content: center;
`

function MadeWithLove() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Built with love by the '}
      <Link color="inherit" href="https://material-ui.com/">
        Material-UI
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
    padding: theme.spacing(8, 0, 6),
    backgroundImage: 'url(https://images.unsplash.com/photo-1561454260-8559bd155736?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1351&q=80)',
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
    padding: '20px 6px',
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
  }




}));

const subdomain = window.location.host.split('.')[1] ? window.location.host.split('.')[0] : false;

const LinkRouter = props => <Link {...props} component={RouterLink} />;

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
      },
      error: ()=>{

      }
    })
  }

  return (
    <React.Fragment>
      <CssBaseline />
      
      {/*<AppBar position="relative">
        <Toolbar>
          <CameraIcon className={classes.icon} />
          <Typography variant="h6" color="inherit" noWrap>
            Help Center
          </Typography>
        </Toolbar>
        </AppBar>*/}

      <main>
        {/* Hero unit */}

        <div className={classes.heroContent}>

          <Container maxWidth="sm">
            
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Help Center
            </Typography>

            { CustomizedInputBase() }

            {/*<Typography variant="h5" align="center" color="textSecondary" paragraph>
              Something short and leading about the collection below—its contents, the creator, etc.
              Make it short and sweet, but not too short so folks don&apos;t simply skip over it
              entirely.
              </Typography>*/}

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
          
          </Container>
        
        </div>

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

                <Container className={classes.cardGrid} maxWidth="md">
                  {/* End hero unit */}
                  <Grid container spacing={4}>
                    {collections.map(card => (
                      <Grid item key={card} xs={12} sm={12} md={4}>
                        <Card className={classes.card}>
                        <RouterLink to={`/collections/${card.slug}`}> 
                            <CardMedia
                              className={classes.cardMedia}
                              image="https://source.unsplash.com/random"
                              title="Image title"
                            />
                            <CardContent className={classes.cardContent}>
                              
                              <Typography gutterBottom variant="h5" component="h2">
                                {card.title}
                              </Typography>

                              <Typography>
                                {card.description}
                              </Typography>

                            </CardContent>
                          </RouterLink>
                          <CardActions>
                            <Button size="small" color="primary">
                              View
                            </Button>
                            <Button size="small" color="primary">
                              Edit
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                </Container>

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
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Something here to give the footer a purpose!
        </Typography>
        <MadeWithLove />
      </footer>
      {/* End footer */}
    </React.Fragment>
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
      <Grid item xs="6" sm="8">

        {
          article ? 
          <Paper className={classes.articlePaper}>


            <Breadcrumbs aria-label="Breadcrumb">
          
              <LinkRouter color="inherit" to="/">
                Articles
              </LinkRouter>

              {
                article.collection ?
                  <LinkRouter color="inherit" to={`/collections/${article.collection.slug}`}>
                    {article.collection.title}
                  </LinkRouter> : null 
              }
      
              <Typography color="textPrimary">
                  {article.title}
              </Typography>
    
            </Breadcrumbs>

            <Divider variant="middle"/>

            <Typography variant="h2" gutterBottom>
              {article.title}
            </Typography>
            <DanteArticle article={article} />
          </Paper> : null 
        }
      </Grid>
      
    </Grid>

  )
}


function Collections(props){

  return (
    <p>skskskosok</p>
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
          
            <Grid item xs="6" sm="8">

              <Paper spacing={5} className={classes.articlePaper}>

                <Breadcrumbs aria-label="Breadcrumb">
              
                  <LinkRouter color="inherit" to="/">
                    Collections
                  </LinkRouter>

                  <Typography color="textPrimary">
                      {collections.title}
                  </Typography>

                
                </Breadcrumbs>
                <Divider variant="middle"/>

                <Typography variant="h2" gutterBottom gutterTop>
                  {collections.title}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  {collections.description}
                </Typography>
              
                <Paper>
                  {
                    collections.baseArticles.map((o)=>(
                      <ListItem divider>
                        <ListItemText primary={
                          <RouterLink to={`/articles/${o.slug}`}>
                            {o.title}
                          </RouterLink>
                        }/>
                      </ListItem>
                    ))
                  }
                </Paper>

                {
                  collections.sections.map((section)=>(
                    <div>
                      <Typography variant="h3" gutterBottom>
                        {section.title}
                      </Typography>

                      <div>
                        <Paper>

                          <List>
                            {
                              section.articles.map((article)=>(
                                  <ListItem divider>
                                    <ListItemText 
                                      primary={<RouterLink to={`/articles/${article.slug}`}>
                                        {article.title}
                                      </RouterLink>}
                                      secondary={article.description}
                                    />
                                  </ListItem>
                              ))
                            }
                          </List>
                        
                        </Paper>
                      </div>
                    </div>
                  ))
                }
              </Paper>
            
            </Grid> : null

          }
      
      </Grid>
    
  )
}