import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


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
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

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
    state = {
        collection: {
            droppable1: [
                {id: "a", content: "sss"},
                {id: "2", content: "9999"},
            ],
            droppable2: [
                {id: "3", content: "oij"},
                {id: "4", content: "ijijij"},
            ],
            droppable3: [
                {id: "5", content: "AAAA"},
                {id: "6", content: "NBBBBB"},
            ],
        } 
           
    };

    getList = id => this.state.collection[id];

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

            var obj = {};
            obj[destination.droppableId] = items;

            this.setState({
                collection: Object.assign({}, 
                  this.state.collection, obj)
            });

        } else {
            const result = move(
                this.state.collection[source.droppableId],
                this.state.collection[destination.droppableId],
                source,
                destination
            );


            this.setState({
                collection: Object.assign({}, 
                  this.state.collection, 
                  result)
            });
        }
    };

    addCollection = (e)=>{
      e.preventDefault()
      const name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      var obj = {}
      obj[name] = []

      this.setState({
          collection: Object.assign({}, 
            this.state.collection, 
            obj)
      });

    }

    render() {
        return (
            <div style={{display: 'flex'}}>

            <a href="#" onClick={this.addCollection}>add collection</a>
            <DragDropContext onDragEnd={this.onDragEnd}>

                {
                   Object.keys(this.state.collection).map((key, i)=>(

                    <React.Fragment>
                      <div style={{
                        display: 'flex', 
                        flexDirection: 'column'
                        }}>
                        <h3>{key}</h3>


                        <Droppable droppableId={key} index={i}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}>
                                    {this.state.collection[key].map((item, index) => (
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
                                                    {item.content}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {
                                      this.state.collection[key].length > 0 ? 
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

