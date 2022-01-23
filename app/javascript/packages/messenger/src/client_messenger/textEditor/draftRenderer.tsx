/**
 *  You can use inline styles or classNames inside your callbacks
 */

import React, { Component } from 'react';
import redraft from 'redraft';
import { AttachmentIcon2 } from '../icons';

import Prism from 'prismjs';

const handlePrismRenderer = (syntax, code) => {
  const formattedCode = Prism.highlight(
    code,
    Prism.languages.javascript,
    'javascript'
  );
  return { __html: formattedCode };
};

function Pre({ children, data }) {
  const el = React.useRef(null);
  const [code, setCode] = React.useState(null);

  React.useEffect(() => {
    setCode(handlePrismRenderer(data.syntax, el.current.innerHTML));
  }, []);

  return (
    <div>
      <div ref={el} style={{ display: 'none' }}>
        {children}
      </div>

      {code && (
        <pre className="graf graf--code" dangerouslySetInnerHTML={code} />
      )}
    </div>
  );
}

// just a helper to add a <br /> after a block
const addBreaklines = (children) => children.map((child) => [child, <br />]);

function getImageUrl(url, props) {
  if (!url) return;
  if (url.includes('://')) return url;
  return `${props.domain}${url}`;
}
/**
 * Define the renderers
 */
function renderers(props) {
  return {
    /**
     * Those callbacks will be called recursively to render a nested structure
     */
    inline: {
      // The key passed here is just an index based on rendering order inside a block
      BOLD: (children, { key }) => <strong key={key}>{children}</strong>,
      ITALIC: (children, { key }) => <em key={key}>{children}</em>,
      UNDERLINE: (children, { key }) => <u key={key}>{children}</u>,
      /* CODE: (children, { key }) => <span
        key={key}
        dangerouslySetInnerHTML={handlePrismRenderer(children)}
      />, */
    },
    /**
     * Blocks receive children and depth
     * Note that children are an array of blocks with same styling,
     */
    blocks: {
      unstyled: (children, { keys }) => {
        return children.map((o, i) => (
          <p key={keys[i]} className="graf graf--p">
            {o}
          </p>
        ));
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
      // You can also access the original keys of the blocks
      'code-block': (children, { _keys, data }) => {
        return <Pre data={data}>{children}</Pre>;
      },
      // or depth for nested lists
      'unordered-list-item': (children, { depth, keys }) => (
        <ul key={keys[keys.length - 1]} className={`ul-level-${depth}`}>
          {children.map(
            (child) => (
              <li className="graf graf--insertunorderedlist">{child}</li>
            ) // eslint-disable-next-line react/jsx-key
          )}
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

      file: (children, { _keys, data }) => {
        const fileName = data[0].url.split('/').pop();
        return (
          <div>
            <a
              href={getImageUrl(data[0].url, props)}
              target="blank"
              rel="noopener noreferrer"
              className="graf graf--attachment"
            >
              <AttachmentIcon2 width={20} height={20} />
              {fileName}
            </a>
          </div>
        );
      },

      image: (children, { keys, data }) => {
        return keys.map((key, index) => (
          <ImageRenderer
            blockKey={key}
            key={`image-${key}`}
            data={data[index]}
            props={props}
          >
            {children[index]}
          </ImageRenderer>
        ));
      },
      embed: (children, { keys, data }) => {
        const { provisory_text, _type, embed_data } = data[0];
        const {
          images,
          title,
          _media,
          provider_url,
          description,
          _url,
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
      video: (children, { keys, data }) => {
        const { provisory_text, _type, embed_data } = data[0];
        const { html } = embed_data;

        return (
          <figure
            key={keys[0]}
            className="graf--figure graf--iframe graf--first"
          >
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
          <figure
            key={keys[0]}
            className="graf--figure graf--iframe graf--first"
          >
            <div className="iframeContainer">
              <video
                autoPlay={false}
                style={{ width: '100%' }}
                controls={true}
                src={getImageUrl(url, props)}
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
        <a key={key} href={data.url} target="_blank" rel="noopener noreferrer">
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
}

function ImageRenderer({ children, blockKey, data, props }) {
  const data2 = data;
  const { url, aspect_ratio, caption } = data2;
  let height, width, ratio;
  if (!aspect_ratio) {
    height = '100%';
    width = '100%';
    ratio = '0';
  } else {
    height = aspect_ratio.height;
    width = aspect_ratio.width;
    ratio = aspect_ratio.ratio;
  }

  const defaultStyle = { maxWidth: `${width}px`, maxHeight: `${height}px` };

  return (
    <figure key={blockKey} className="graf graf--figure">
      <div>
        <div className="aspectRatioPlaceholder is-locked" style={defaultStyle}>
          <div
            className="aspect-ratio-fill"
            style={{ paddingBottom: `${ratio}%` }}
          ></div>

          {/* <ConnectedImage url={url} width={width} height={height} /> */}

          <img
            src={getImageUrl(url, props)}
            className="graf-image"
            width={width}
            height={height}
            contentEditable="false"
          />
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

type RendererProps = {
  message?: any;
  domain?: string;
  raw: string;
};
export default class Renderer extends Component<RendererProps> {
  /* static propTypes = {
    raw: PropTypes.object
  } */

  renderWarning() {
    if (this.props.message && this.props.message.message.htmlContent) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: this.props.message.message.htmlContent,
          }}
        />
      );
    } else {
      return <div>---</div>;
    }
  }

  render() {
    const { raw } = this.props;
    if (!raw) {
      return this.renderWarning();
    }
    const rendered = redraft(raw, renderers(this.props));
    // redraft returns a null if there's nothing to render
    if (!rendered) {
      return this.renderWarning();
    }
    return <div>{rendered}</div>;
  }
}
