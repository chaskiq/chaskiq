import React from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Input from '../../forms/Input';
//import attribution from '../../../images/Poweredby_100px-White_VertText.png'
const GiphyBlock = styled.div`
  //position: absolute;
  //left: 128px;
  //bottom: 48px;
  //z-index: 10000;
  //height: 251px;
  background: white;
  //border: 1px solid #abaaaa;
  //border-radius: 3px;
  //width: 223px;
  //box-shadow: 1px 1px 1px #ece3e3;
`;

const GridListOverflow = styled.div`
  height: 187px;
  overflow: auto;
`;
const GridList = styled.div`
  display: flex;
  display: flex;
  flex-flow: row wrap;
  margin-left: -8px;
  width: 100%;
  img {
    flex: auto;
    height: 250px;
    min-width: 150px;
    margin: 0 8px 8px 0;
  }
`;

const Container = styled.div`
  padding: 10px;
  background: '#ccc';
`;

const PickerBlock = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 4px;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: #c4e17f;
    background-image: -webkit-linear-gradient(
      left,
      #fff35c,
      #fff35c,
      #ff6666,
      #ff6666,
      #9933ff,
      #9933ff,
      #00ccff,
      #00ccff,
      #00ff99,
      #00ff99
    );
    background-image: -moz-linear-gradient(
      left,
      #fff35c,
      #fff35c,
      #ff6666,
      #ff6666,
      #9933ff,
      #9933ff,
      #00ccff,
      #00ccff,
      #00ff99,
      #00ff99
    );
    background-image: -o-linear-gradient(
      left,
      #fff35c,
      #fff35c,
      #ff6666,
      #ff6666,
      #9933ff,
      #9933ff,
      #00ccff,
      #00ccff,
      #00ff99,
      #00ff99
    );
    background-image: linear-gradient(
      left,
      #fff35c,
      #fff35c,
      #ff6666,
      #ff6666,
      #9933ff,
      #9933ff,
      #00ccff,
      #00ccff,
      #00ff99,
      #00ff99
    );
  }
`;

type GiphyComponentProps = {
  apiKey: string;
  handleSelected: (val: any) => void;
};
type GiphyComponentState = {
  gifs: Array<any>;
  limit: number;
  term: string;
};
export default class GiphyComponent extends React.Component<
  GiphyComponentProps,
  GiphyComponentState
> {
  input_ref: any;
  constructor(props) {
    super(props);
    this.state = {
      gifs: [],
      limit: 10,
      term: '',
    };
    this.input_ref = null;
  }

  componentDidMount() {
    this.search('', 'trend');
  }

  onSearchSubmit = (e) => {
    if (e.key != 'Enter') {
      return;
    }

    const term = this.input_ref.value;

    this.search(term);
  };

  search = (term, kind = 'search') => {
    const url =
      kind === 'search'
        ? `https://api.giphy.com/v1/gifs/search?q=${term}`
        : `https://api.giphy.com/v1/gifs/trending?q=${term}`;
    const link = `${url}&limit=${this.state.limit}&api_key=${this.props.apiKey}`;

    axios
      .get(link)
      .then((response) => {
        // handle success
        this.setState({ gifs: response.data.data });
        // console.log(response);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  };

  limitSubmit = (limit) => {
    this.setState({ limit: limit }, function () {
      console.log('LIMIT:', this.state.limit);
    });
  };

  handleChange = (e) => {
    const term = e.target.value;
    this.setState({
      term: term,
    });
  };

  render() {
    return (
      <GiphyBlock>
        <Container>
          <PickerBlock>
            <Input
              ref={(c) => (this.input_ref = c)}
              type="text"
              placeholder={'search gif'}
              value={this.state.term}
              onChange={this.handleChange}
              onKeyDown={this.onSearchSubmit}
            />
          </PickerBlock>

          <GridListOverflow>
            <GridList>
              {this.state.gifs.map((o) => (
                <img
                  key={`giphy-${o.id}`}
                  onClick={(_e) => this.props.handleSelected(o)}
                  height={o.images.fixed_width_downsampled.height}
                  width={o.images.fixed_width_downsampled.width}
                  src={o.images.fixed_width_downsampled.url}
                />
              ))}
            </GridList>
          </GridListOverflow>

          <div className="flex justify-center mt-2">
            {/*<img src={attribution} className="h-6 mt-2" />*/}
          </div>
        </Container>
        {/* <Arrow/> */}
      </GiphyBlock>
    );
  }
}
