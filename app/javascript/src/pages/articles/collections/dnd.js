import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { ListItem, ItemAvatar, ListItemText } from "../../../components/List";
import Button from "../../../components/Button";

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
  return {
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    //padding: grid * 2,
    //margin: `0 0 ${grid}px 0`,
    // change background colour if dragging
    //background: isDragging ? 'lightgreen' : '#ff0000',
    // styles we need to apply on draggables
    ...draggableStyle,
  };
};

const getItemClass = (isDragging, draggableStyle) => {
  const dragClass = isDragging ? "bg-gray-400 opacity-50" : "";
  return dragClass;
};

const getListStyle = (isDraggingOver) => {
  return {
    //background: isDraggingOver ? 'lightblue' : "#ff0000",
    //padding: grid,
    //width: 250
  };
};

const getListClass = (isDraggingOver) => {
  const dragClass = isDraggingOver ? "bg-red-200" : "shadow rounded border p-4";
  return dragClass;
};

class App extends Component {
  constructor(props) {
    super(props);
    /*this.props = {
      sections: this.props.sections
    }*/
  }

  getList = (id) => this.props.sections.find((o) => o.id === id).articles;

  onDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const el = this.getList(source.droppableId)[source.index];
    const section = this.props.sections.find(
      (o) => o.id === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      const newCollection = this.props.sections.map((o) => {
        if (o.id === destination.droppableId)
          return Object.assign({}, o, { articles: items });
        return o;
      });

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

      const newCollection = this.props.sections.map((o) => {
        const obj = result[o.id];
        if (obj) return Object.assign({}, o, { articles: obj ? obj : [] });
        return o;
      });

      this.updateSections(newCollection);
    }

    this.props.saveOperation({
      id: el.id,
      position: destination.index,
      section: String(section.id),
      collection: String(this.props.collectionId),
    });
  };

  updateSections = (data) => {
    /*this.setState({ sections: data }, ()=>{ 
      this.props.handleDataUpdate(this.props.sections)
    });*/

    this.props.handleDataUpdate(data);
  };

  render() {
    const { classes } = this.props;
    return (
      <div style={{ displayDisable: "flex" }}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          {this.props.sections.map((o, i) => (
            <React.Fragment>
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline py-2">
                  <div>
                    <h3 className="text-3xl leading-6 font-medium text-gray-900 py-4">
                      {o.title}
                    </h3>
                  </div>

                  <div item>
                    <Button
                      variant={"outlined"}
                      onClick={() => this.props.requestUpdate(o)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <Droppable droppableId={o.id} index={i}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      className={getListClass(snapshot.isDraggingOver)}
                    >
                      {o.articles &&
                        o.articles.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={getItemClass(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                              >
                                <ListItem divider={true}>
                                  <ItemAvatar 
                                    avatar={item.author.avatarUrl}
                                  />
                                  <ListItemText
                                    primary={
                                      <p className="text-lg leading-6 font-medium text-gray-900 pb-1">
                                        {item.title}
                                      </p>
                                    }
                                    secondary={
                                      <span className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                                        {item.author.name}
                                        <br />
                                        {item.author.email}
                                      </span>
                                    }
                                  />
                                </ListItem>
                              </div>
                            )}
                          </Draggable>
                        ))}

                      {provided.placeholder}

                      <div className="py-2">
                        <Button
                          variant="outlined"
                          color="primary"
                          size={"small"}
                          className="mr-2"
                          onClick={(e) => this.props.addArticlesToSection(o)}
                        >
                          Add articles
                        </Button>

                        {o.id !== "base" && (
                          <Button
                            size={"small"}
                            variant="danger"
                            color="secondary"
                            onClick={(e) => this.props.deleteSection(o)}
                          >
                            Delete section
                          </Button>
                        )}
                      </div>

                      <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                        {o.articles.length} articles
                      </p>
                    </div>
                  )}
                </Droppable>
              </div>
            </React.Fragment>
          ))}
        </DragDropContext>
      </div>
    );
  }
}

export default App;
