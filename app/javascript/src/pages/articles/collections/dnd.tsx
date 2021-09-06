import React, { Component } from 'react';

import I18n from '../../../shared/FakeI18n';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Button from '@chaskiq/components/src/components/Button';
import {
  ListItem,
  ItemAvatar,
  ListItemText,
} from '@chaskiq/components/src/components/List';
import { AnchorLink } from '@chaskiq/components/src/components/RouterLink';

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

const getItemStyle = (_isDragging, draggableStyle) => {
  return {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // padding: grid * 2,
    // margin: `0 0 ${grid}px 0`,
    // change background colour if dragging
    // background: isDragging ? 'lightgreen' : '#ff0000',
    // styles we need to apply on draggables
    ...draggableStyle,
  };
};

const getItemClass = (isDragging, _draggableStyle) => {
  const dragClass = isDragging ? 'bg-gray-400 opacity-50' : '';
  return dragClass;
};

const getListStyle = (_isDraggingOver) => {
  return {
    // background: isDraggingOver ? 'lightblue' : "#ff0000",
    // padding: grid,
    // width: 250
  };
};

const getListClass = (isDraggingOver) => {
  const dragClass = isDraggingOver ? 'bg-red-200' : 'shadow rounded border p-4';
  return dragClass;
};

type DndProps = {
  sections: any;
  saveOperation: any;
  collectionId: any;
  handleDataUpdate: any;
  app: any;
  requestUpdate: any;
  addArticlesToSection: any;
  deleteSection: any;
};
class Dnd extends Component<DndProps> {
  constructor(props) {
    super(props);
    /* this.props = {
      sections: this.props.sections
    } */
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
        if (o.id === destination.droppableId) {
          return Object.assign({}, o, { articles: items });
        }
        return o;
      });

      this.updateSections(newCollection);
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        // this.props.sections[source.droppableId],
        // this.props.sections[destination.droppableId],
        source,
        destination
      );

      const newCollection = this.props.sections.map((o) => {
        const obj = result[o.id];
        if (obj) return Object.assign({}, o, { articles: obj || [] });
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
    /* this.setState({ sections: data }, ()=>{
      this.props.handleDataUpdate(this.props.sections)
    }); */

    this.props.handleDataUpdate(data);
  };

  render() {
    return (
      <div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          {this.props.sections.map((o, i) => (
            <React.Fragment key={`dnd-sections-${i}`}>
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline py-2">
                  <div>
                    <h3 className="text-3xl leading-6 font-medium text-gray-900 py-4 dark:text-gray-100">
                      {o.title}
                    </h3>
                  </div>

                  <div>
                    {o.id !== 'base' && (
                      <Button
                        variant={'outlined'}
                        onClick={() => this.props.requestUpdate(o)}
                      >
                        {I18n.t('common.edit')}
                      </Button>
                    )}
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
                                  <ItemAvatar avatar={item.author.avatarUrl} />
                                  <ListItemText
                                    primary={
                                      <AnchorLink
                                        to={`/apps/${this.props.app.key}/articles/${item.slug}`}
                                      >
                                        <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-1 hover:underline">
                                          {item.title}
                                        </p>
                                      </AnchorLink>
                                    }
                                    secondary={
                                      <span className="mt-2 max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-300">
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
                          size={'small'}
                          className="mr-2"
                          onClick={(_e) => this.props.addArticlesToSection(o)}
                        >
                          {I18n.t('articles.add_articles')}
                        </Button>

                        {o.id !== 'base' && (
                          <Button
                            size={'small'}
                            variant="danger"
                            color="secondary"
                            onClick={(_e) => this.props.deleteSection(o)}
                          >
                            {I18n.t('articles.delete_section')}
                          </Button>
                        )}
                      </div>

                      <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-300">
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

export default Dnd;
