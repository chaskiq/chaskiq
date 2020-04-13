import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button' 
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

import { useTheme } from '@material-ui/core/styles';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  paper: {
    margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'
  },
  button: {
    margin: theme.spacing(1),
  },
});

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => {
  const theme = useTheme();

  return {
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  //padding: grid * 2,
  //margin: `0 0 ${grid}px 0`,
  // change background colour if dragging
  background: isDragging ? 'lightgreen' : theme.palette.background.paper,
  // styles we need to apply on draggables
  ...draggableStyle
}};

const getListStyle = isDraggingOver => {
  const theme = useTheme();
  return {
    background: isDraggingOver ? 'lightblue' : theme.palette.background.paper,
    padding: grid,
    //width: 250
  }
};

class App extends Component {

  constructor(props){
    super(props)
    /*this.props = {
      sections: this.props.sections
    }*/
  }

  getList = id => this.props.sections.find((o)=> o.id === id).articles;

  onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
        return;
    }

    const el = this.getList(source.droppableId)[source.index]
    const section = this.props.sections.find((o)=> o.id === destination.droppableId )


    if (source.droppableId === destination.droppableId) {
        const items = reorder(
            this.getList(source.droppableId),
            source.index,
            destination.index
        );
        
        const newCollection = this.props.sections.map((o)=> {
          if(o.id === destination.droppableId) return Object.assign({}, o, {articles: items} )
          return o
        })

        this.updateSections(newCollection);

    } else {
        const result = move(
            this.getList(source.droppableId),
            this.getList(destination.droppableId),
            //this.props.sections[source.droppableId],
            //this.props.sections[destination.droppableId],
            source,
            destination
        );

        const newCollection = this.props.sections.map((o)=> {
          const obj = result[o.id]
          if(obj) return Object.assign({}, o, { articles: obj ? obj : [] } )
          return o
        })

        this.updateSections(newCollection);
    }

    this.props.saveOperation({
      id: el.id,
      position: destination.index,
      section: String(section.id),
      collection: String(this.props.collectionId)
    })

  };

  updateSections = (data)=>{

    /*this.setState({ sections: data }, ()=>{ 
      this.props.handleDataUpdate(this.props.sections)
    });*/

    this.props.handleDataUpdate(data)
  }

  render() {
    const {classes} = this.props
    return (
        <div style={{displayDisable: 'flex'}}>

        <DragDropContext onDragEnd={this.onDragEnd}>

            {
               this.props.sections.map((o, i)=>(

                <React.Fragment>
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column'
                    }}>
                    <Grid container
                      justify='space-between'
                      alignItems="baseline">
                      <Grid item>
                      <h3>
                        {o.title}
                      </h3>
                      </Grid>

                      <Grid item>
                      <Button variant={"outlined"} onClick={()=>this.props.requestUpdate(o)}>
                        edit
                      </Button>
                      </Grid>
                    </Grid>


                    <Droppable droppableId={o.id} index={i}>
                        {(provided, snapshot) => (
                            <Paper
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}>

                                {
                                  o.articles &&
                                  o.articles.map((item, index) => (
                                    <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}>

                                                <ListItem divider={true}>
                                                  <ListItemAvatar>
                                                    <Avatar>
                                                     
                                                    </Avatar>
                                                  </ListItemAvatar>
                                                  <ListItemText 
                                                    primary={item.title} 
                                                    secondary={
                                                      <span>
                                                        {item.author.name }<br/>
                                                        {item.author.email}
                                                      </span>
                                                    } />
                                                </ListItem>

                                            </div>
                                        )}
                                    </Draggable>
                                  ))
                                }

                                {provided.placeholder}

                                <Button className={classes.button} 
                                  variant="outlined" 
                                  color="primary"
                                  size={"medium"}
                                  onClick={(e)=> this.props.addArticlesToSection(o)}>
                                  Add articles
                                </Button>


                                {
                                  o.id != "base" ? 

                                  <Button className={classes.button} 
                                    size={"medium"}
                                    variant="outlined" 
                                    color="secondary"
                                    onClick={(e)=> this.props.deleteSection(o)}>
                                    delete section
                                  </Button> : null
                                }

                                <p>
                                  {o.articles.length} 
                                  articles
                                </p>
                                
                            </Paper>
                        )}
                    </Droppable>
                  </div>

                </React.Fragment>

               )
              )
            }
            
        </DragDropContext>
        </div>
    );
  }
}


export default withStyles(styles)(App)