/**
 *  You can use inline styles or classNames inside your callbacks
 */

import React, {Component} from 'react'
import redraft from 'redraft'

import Prism from 'prismjs'

//Prism.highlightAll();

const handlePrismRenderer = (syntax, children)=>{
  const code = children.map((o)=> o.flat() ).join("")
  const formattedCode =  Prism.highlight(code, Prism.languages.javascript, 'javascript');
  return {__html: formattedCode }
}

const styles = {
  code: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 20,
  },
};

// just a helper to add a <br /> after a block
const addBreaklines = (children) => children.map(child => [child, <br />]);

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
    //CODE: (children, { key }) => <span key={key} dangerouslySetInnerHTML={handlePrismRenderer(children)} />,
  },
  /**
   * Blocks receive children and depth
   * Note that children are an array of blocks with same styling,
   */
  blocks: {

    
    unstyled: (children, { keys }) => {
      return <p  key={keys[0]} 
                className="graf graf--p">
                {children}
            </p>

    },
    blockquote: (children, { keys }) => <blockquote 
                                          key={keys[0]} 
                                          className="graf graf--blockquote">
                                {addBreaklines(children)}
                              </blockquote>,
    'header-one': (children, { keys }) => <h1 key={keys[0]} className="graf graf--h2">{children}</h1>,
    'header-two': (children, { keys }) => <h2 key={keys[0]} className="graf graf--h3">{children}</h2>,
    // You can also access the original keys of the blocks
    'code-block': (children, { keys, data }) => {
      return <pre className="graf graf--code" 
                  //style={styles.codeBlock} 
                  key={keys[0]} 
                  dangerouslySetInnerHTML={handlePrismRenderer(data.syntax, children)}>
                  {/*addBreaklines(children)*/}
            </pre>},
    // or depth for nested lists
    'unordered-list-item': (children, { depth, keys }) => <ul key={keys[keys.length - 1]} className={`ul-level-${depth}`}>
                                                            {children.map(child => <li className="graf graf--insertunorderedlist">
                                                              {child}
                                                            </li>)}
                                                          </ul>,
    'ordered-list-item': (children, { depth, keys }) => <ol key={keys.join('|')} className={`ol-level-${depth}`}>{
      children.map((child, index) => <li key={keys[index]} className="graf graf--insertorderedlist">
        {child}
      </li>)
    }</ol>,
    'image': (children, {keys, data}) => {
      const data2 = data[0]
      const {url, aspect_ratio, caption} = data2

 
      if(!aspect_ratio){
        var height = "100%"
        var width  = "100%"
        var ratio  = "100%"
      }else{
        var { height, width, ratio} = aspect_ratio 
      }

      return  <figure  key={keys[0]} className="graf graf--figure">
                  <div>
                    <div className="aspectRatioPlaceholder is-locked" 
                      //style={{maxWidth: '1000px', maxHeight: `${height}px`}}
                      >
                      <div className="aspect-ratio-fill" 
                          style={{paddingBottom: `${ratio}%`}}>
                      </div>

                      <img src={url}
                        className="graf-image" 
                        width={width}
                        height={height}
                        contentEditable="false"/>
                    </div>

                  </div>
                  <figcaption className="imageCaption">
                    <span>
                      <span data-text="true">{caption}</span>
                    </span>
                  </figcaption>

              </figure>
    },
    embed: (children, {keys, data})=>{

      const {provisory_text, type, embed_data } = data[0]
      const {images, title, media, provider_url, description, url } = embed_data

      return <div  key={keys[0]} className="graf graf--mixtapeEmbed">
              <span>
                {
                  images[0].url ?
                    <a target="_blank" className="js-mixtapeImage mixtapeImage"
                      href={provisory_text}
                      style={{ backgroundImage: `url(${images[0].url})` }}>
                    </a> : null 
                }
                <a className="markup--anchor markup--mixtapeEmbed-anchor"
                  target="_blank"
                  href={provisory_text}>
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

    },
    video: (children, {keys, data})=>{

      const {provisory_text, type, embed_data } = data[0]
      const {html} = embed_data

      return <figure  key={keys[0]} className="graf--figure graf--iframe graf--first" tabindex="0">
                <div className="iframeContainer" dangerouslySetInnerHTML={
                          { __html: `${html}` }
                        }/>
                <figcaption className="imageCaption">
                  <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                    <span>
                    <span>
                    {provisory_text}
                    </span>
                    </span>
                  </div>
                </figcaption>
            </figure>
    },
    'recorded-video': (children, {keys, data})=>{
      const {url, text} = data[0]

      return <figure  key={keys[0]} className="graf--figure graf--iframe graf--first" 
               tabindex="0">
              <div className="iframeContainer">
                <video 
                  autoplay={false} 
                  style={{width:"100%" }}
                  controls={true} 
                  src={url}>
                </video>
              </div>
              <figcaption className="imageCaption">
                <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                  <span>
                  {text}
                  </span>
                </div>
              </figcaption>
            </figure>
    },
    // If your blocks use meta data it can also be accessed like keys
    //atomic: (children, { keys, data }) => children.map((child, i) => <Atomic key={keys[i]} {...data[i]} />),
  },
  /**
   * Entities receive children and the entity data
   */
  entities: {
    // key is the entity key value from raw
    LINK: (children, data, { key }) => 
    <a key={key} href={data.url}>
      {children}
    </a>,
  },
  /**
   * Array of decorators,
   * Entities receive children and the entity data,
   * inspired by https://facebook.github.io/draft-js/docs/advanced-topics-decorators.html
   * it's also possible to pass a custom Decorator class that matches the [DraftDecoratorType](https://github.com/facebook/draft-js/blob/master/src/model/decorators/DraftDecoratorType.js)
   */
  /*decorators: [
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
  ],*/
}



export default class Renderer extends Component {

  /*static propTypes = {
    raw: PropTypes.object
  }*/

  renderWarning() {
    return <div>---</div>;
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
    return (
      <div>
        {rendered}
      </div>
    );
  }
}