/**
 *  You can use inline styles or classNames inside your callbacks
 */

import React, { Component } from 'react';
import redraft from 'redraft';
import { connect } from 'react-redux';
import { AttachmentIcon } from '../icons';

import Prism from 'prismjs';
// Prism.highlightAll();
import { setImageZoom } from '@chaskiq/store/src/actions/imageZoom';

const handlePrismRenderer = (syntax, children) => {
  const code = children
    .flat()
    .flat()
    .map((o) => (o.props ? o.props.children.join(' ') : o))
    .join('\r');
  const formattedCode = Prism.highlight(
    code,
    Prism.languages.javascript,
    syntax || 'javascript'
  );
  return { __html: formattedCode };
};

// just a helper to add a <br /> after a block
const addBreaklines = (children) => children.map((child) => [child, <br />]);

/**
 * Define the renderers
 */
const renderers = {
  /**
   * Those callbacks will be called recursively to render a nested structure
   */
  inline: {
    // The key passed here is just an index based on rendering order inside a block
    BOLD: (children, { key }) => <strong key={key}>{children}</strong>,
    ITALIC: (children, { key }) => <em key={key}>{children}</em>,
    UNDERLINE: (children, { key }) => <u key={key}>{children}</u>,
    // CODE: (children, { key }) => <span key={key} dangerouslySetInnerHTML={handlePrismRenderer(children)} />,
  },
  /**
   * Blocks receive children and depth
   * Note that children are an array of blocks with same styling,
   */
  blocks: {
    unstyled: (children, { keys }) => {
      return (
        <p key={keys[0]} className="graf graf--p">
          {addBreaklines(children)}
        </p>
      );
      /* children.map(
        (o, i)=> ( <p key={keys[i]} className="graf graf--p">{o}</p>)
      ) */
    },
    blockquote: (children, { keys }) => (
      <blockquote key={keys[0]} className="graf graf--blockquote">
        {addBreaklines(children)}
      </blockquote>
    ),
    'header-one': (children, { keys }) => (
      <h1 key={keys[0]} className="graf graf--h2">
        {children}
      </h1>
    ),
    'header-two': (children, { keys }) => (
      <h2 key={keys[0]} className="graf graf--h3">
        {children}
      </h2>
    ),
    'header-three': (children, { keys }) => (
      <h3 key={keys[0]} className="graf graf--h4">
        {children}
      </h3>
    ),
    // You can also access the original keys of the blocks
    'code-block': (children, { keys, data }) => {
      return (
        <pre
          className="graf graf--code"
          // style={styles.codeBlock}
          key={keys[0]}
          dangerouslySetInnerHTML={handlePrismRenderer(data.syntax, children)}
        >
          {/* addBreaklines(children) */}
        </pre>
      );
    },
    // or depth for nested lists
    'unordered-list-item': (children, { depth, keys }) => (
      <ul key={keys[keys.length - 1]} className={`ul-level-${depth}`}>
        {children.map((child) => (
          <li className="graf graf--insertunorderedlist">{child}</li>
        ))}
      </ul>
    ),
    'ordered-list-item': (children, { depth, keys }) => (
      <ol key={keys.join('|')} className={`ol-level-${depth}`}>
        {children.map((child, index) => (
          <li key={keys[index]} className="graf graf--insertorderedlist">
            {child}
          </li>
        ))}
      </ol>
    ),

    file: (_children, { keys, data }) => {
      const fileName = data[0].url.split('/').pop();
      return (
        <div>
          <a
            href={data[0].url}
            rel="noopener noreferrer"
            target="blank"
            className="flex items-center border rounded text-gray-100 bg-gray-800 border-gray-600 p-4 py-2"
          >
            <AttachmentIcon></AttachmentIcon>
            {fileName}
          </a>
        </div>
      );
    },

    giphy: (children, { keys, data }) => {
      return keys.map((key, index) => (
        <ImageRenderer blockKey={key} key={`image-${key}`} data={data[index]}>
          {children[index]}
        </ImageRenderer>
      ));
    },
    image: (children, { keys, data }) => {
      return keys.map((key, index) => (
        <ImageRenderer blockKey={key} key={`image-${key}`} data={data[index]}>
          {children[index]}
        </ImageRenderer>
      ));
    },
    embed: (_children, { keys, data }) => {
      const { provisory_text, embed_data } = data[0];
      const {
        images,
        title,
        //media,
        provider_url,
        description,
        //url
      } = embed_data;

      return (
        <div key={keys[0]} className="graf graf--mixtapeEmbed">
          <span>
            {images[0].url ? (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="js-mixtapeImage mixtapeImage"
                href={provisory_text}
                style={{
                  backgroundImage: `url(${images[0].url})`,
                }}
              ></a>
            ) : null}
            <a
              className="markup--anchor markup--mixtapeEmbed-anchor"
              target="_blank"
              rel="noopener noreferrer"
              href={provisory_text}
            >
              <strong className="markup--strong markup--mixtapeEmbed-strong">
                {title}
              </strong>
              <em className="markup--em markup--mixtapeEmbed-em">
                {description}
              </em>
            </a>
            {provider_url}
          </span>
        </div>
      );
    },
    video: (_children, { keys, data }) => {
      const { provisory_text, embed_data } = data[0];
      const { html } = embed_data;

      return (
        <figure key={keys[0]} className="graf--figure graf--iframe graf--first">
          <div
            className="iframeContainer"
            dangerouslySetInnerHTML={{ __html: `${html}` }}
          />

          {provisory_text && provisory_text === 'type a caption (optional)' && (
            <figcaption className="imageCaption">
              <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                <span>
                  <span>{provisory_text}</span>
                </span>
              </div>
            </figcaption>
          )}
        </figure>
      );
    },
    'recorded-video': (children, { keys, data }) => {
      const { url, text } = data[0];

      return (
        <figure key={keys[0]} className="graf--figure graf--iframe graf--first">
          <div className="iframeContainer">
            <video
              autoPlay={false}
              style={{ width: '100%' }}
              controls={true}
              src={url}
            ></video>
          </div>
          <figcaption className="imageCaption">
            <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
              <span>{text}</span>
            </div>
          </figcaption>
        </figure>
      );
    },
    // If your blocks use meta data it can also be accessed like keys
    // atomic: (children, { keys, data }) => children.map((child, i) => <Atomic key={keys[i]} {...data[i]} />),
  },
  /**
   * Entities receive children and the entity data
   */
  entities: {
    // key is the entity key value from raw
    LINK: (children, data, { key }) => (
      <a rel="noopener noreferrer" key={key} href={data.url} target="_blank">
        {children}
      </a>
    ),
  },
  /**
   * Array of decorators,
   * Entities receive children and the entity data,
   * inspired by https://facebook.github.io/draft-js/docs/advanced-topics-decorators.html
   * it's also possible to pass a custom Decorator class that matches the [DraftDecoratorType](https://github.com/facebook/draft-js/blob/master/src/model/decorators/DraftDecoratorType.js)
   */
  /* decorators: [
    {
      // by default linkStrategy receives a ContentBlock stub (more info under Creating the ContentBlock)
      // strategy only receives first two arguments, contentState is yet not provided
      strategy: linkStrategy,
      // component - a callback as with other renderers
      // decoratedText a plain string matched by the strategy
      // if your decorator depends on draft-js contentState you need to provide convertFromRaw in redraft options
      component: ({ children, decoratedText }) => <a href={decoratedText}>{children}</a>,
    },
    new CustomDecorator(someOptions),
  ], */
};

function ImageRenderer({ children, blockKey, data }) {
  const data2 = data;
  const { url, aspect_ratio, caption } = data2;

  var height, width, ratio;

  if (!aspect_ratio) {
    height = '100%';
    width = '100%';
    ratio = '100';
  } else {
    height = aspect_ratio.height;
    width = aspect_ratio.width;
    ratio = aspect_ratio.ratio;
  }

  const defaultStyle = { maxWidth: `${width}px`, maxHeight: `${height}px` };

  function directionClass(direction) {
    switch (direction) {
      case 'left':
        return 'graf--layoutOutsetLeft';
      case 'center':
        return '';
      case 'wide':
        return 'sectionLayout--fullWidth';
      case 'fill':
        return 'graf--layoutFillWidth';
      default:
        return '';
    }
  }

  let defaultAlignment = directionClass(data.direction);
  return (
    <figure key={blockKey} className={`graf graf--figure ${defaultAlignment}`}>
      <div>
        <div className="aspectRatioPlaceholder is-locked" style={defaultStyle}>
          <div
            className="aspect-ratio-fill"
            style={{ paddingBottom: `${ratio}%` }}
          ></div>

          <ConnectedImage url={url} width={width} height={height} />
        </div>
      </div>

      {caption && caption !== 'type a caption (optional)' && (
        <figcaption className="imageCaption">
          <span>
            <span data-text="true">{children}</span>
          </span>
        </figcaption>
      )}
    </figure>
  );
}

function Image({ dispatch, url, width, height }) {
  return (
    <img
      src={url}
      className="graf-image"
      width={width}
      height={height}
      contentEditable="false"
      onClick={(_e) =>
        dispatch(
          setImageZoom({
            url: url,
            width: width,
            height: height,
          })
        )
      }
    />
  );
}

function mapActionsToProps() {
  return {
    actions: {},
  };
}

const ConnectedImage = connect(mapActionsToProps)(Image);

type RendererType = {
  raw: string;
  html?: string;
};
export default class Renderer extends Component<RendererType> {
  /* static propTypes = {
    raw: PropTypes.object
  } */

  renderWarning() {
    if (this.props.html) {
      return <div dangerouslySetInnerHTML={{ __html: this.props.html }} />;
    } else {
      return <div>---</div>;
    }
  }

  render() {
    const { raw } = this.props;
    if (!raw) {
      return this.renderWarning();
    }
    const rendered = redraft(raw, renderers);
    // redraft returns a null if there's nothing to render
    if (!rendered) {
      return this.renderWarning();
    }
    return <div>{rendered}</div>;
  }
}
