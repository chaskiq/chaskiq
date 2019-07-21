import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@material-ui/core'


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

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  //padding: grid * 2,
  //margin: `0 0 ${grid}px 0`,
  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250
});

export default class App extends Component {

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

    if (source.droppableId === destination.droppableId) {
        const items = reorder(
            this.getList(source.droppableId),
            source.index,
            destination.index
        );

        const el = this.getList(source.droppableId)[source.index]
        const section = this.props.sections.find((o)=> o.id === destination.droppableId )

        
        const newCollection = this.props.sections.map((o)=> {
          if(o.id === destination.droppableId) return Object.assign({}, o, {articles: items} )
          return o
        })

        this.updateSections(newCollection);
        
        this.props.saveOperation({
          id: el.id,
          position: destination.index,
          section: String(section.id),
          collection: String(this.props.collectionId)
        })

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
  };

  updateSections = (data)=>{

    /*this.setState({ sections: data }, ()=>{ 
      this.props.handleDataUpdate(this.props.sections)
    });*/

    this.props.handleDataUpdate(data)
  }

  render() {

    return (
        <div style={{display: 'flex'}}>

        <DragDropContext onDragEnd={this.onDragEnd}>

            {
               this.props.sections.map((o, i)=>(

                <React.Fragment>
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column'
                    }}>
                    <h3>
                      {o.id} {o.title}
                    </h3>


                    <Droppable droppableId={o.id} index={i}>
                        {(provided, snapshot) => (
                            <div
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

                                                <ListItem>
                                                  <ListItemAvatar>
                                                    <Avatar>
                                                     
                                                    </Avatar>
                                                  </ListItemAvatar>
                                                  <ListItemText 
                                                    primary={item.title} 
                                                    secondary={item.author.email} />
                                                </ListItem>

                                            </div>
                                        )}
                                    </Draggable>
                                  ))
                                }

                                {provided.placeholder}

                                <button onClick={(e)=> this.props.deleteSection(o)}>
                                  delete section
                                </button>
                                {
                                  o.articles.length > 0 ? 
                                  <p>hay</p> : <p>no hay!</p>
                                }
                            </div>
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

