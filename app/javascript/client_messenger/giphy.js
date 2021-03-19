import React from 'react'
import axios from 'axios'
import styled from '@emotion/styled'
import attribution from './icons/Poweredby_100px-White_VertText.png'

const GiphyBlock = styled.div`
  position: absolute;
  left: 128px;
  bottom: 48px;
  z-index: 10000;
  height: 251px;
  background: white;
  border: 1px solid #abaaaa;
  border-radius: 3px;
  width: 56%;
  box-shadow: 1px 1px 1px #ece3e3;
`

const GridListOverflow = styled.div`
  height: 187px;
  overflow: auto
`
const GridList = styled.div`  
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 1 0px;
  img{
    //width: 250px;
    margin-bottom: 4px;
    background-color: lightgray;
  }
`

const Container = styled.div`
  padding: 10px;
  background: "#ccc";
`

const Attribution = styled.div`
  display: flex;
  justify-content: center;
  img {
    height: 20px
  }

  position: absolute;
  bottom: 5px;
  width: 100%;
  background: white;
  padding: 4px 0px;
`

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
      background-image: -webkit-linear-gradient(left, #fff35c, #fff35c, #ff6666, #ff6666, #9933ff, #9933ff, #00ccff, #00ccff, #00ff99, #00ff99);
      background-image: -moz-linear-gradient(left, #fff35c, #fff35c, #ff6666, #ff6666, #9933ff, #9933ff, #00ccff, #00ccff, #00ff99, #00ff99);
      background-image: -o-linear-gradient(left, #fff35c, #fff35c, #ff6666, #ff6666, #9933ff, #9933ff, #00ccff, #00ccff, #00ff99, #00ff99);
      background-image: linear-gradient(left, #fff35c, #fff35c, #ff6666, #ff6666, #9933ff, #9933ff, #00ccff, #00ccff, #00ff99, #00ff99);
    }
`

const Input = styled.input`
  padding: 10px;
  width: 100%;
  margin-top: 8px;
`

const trendingUrl = 'https://api.giphy.com/v1/gifs/trending'
const searchUrl = 'https://api.giphy.com/v1/gifs/search'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      gifs: [],
      limit: 5
    }
    this.input_ref = null
  }

  componentDidMount () {
    const link = `${trendingUrl}?api_key=${this.props.apikey}`
    this.getData(link)
  }

  onSearchSubmit = (e) => {
    if (e.key != 'Enter') {
      return
    }
    const term = this.input_ref.value
    const link = `${searchUrl}?q=${term}&limit=${this.state.limit}&api_key=${this.props.apikey}`
    this.getData(link)
  }

  getData = (link) => {
    axios.get(link).then(
      (response) => {
        // handle success
        this.setState({ gifs: response.data.data })
        // console.log(response);
      })
      .catch((error) => {
        // handle error
        console.log(error)
      })
  }

  limitSubmit = (limit) => {
    this.setState({ limit: limit }, function () {
      console.log('LIMIT:', this.state.limit)
    })
  }

  render () {
    return (
      <GiphyBlock>
        <Container>

          <PickerBlock>
            <Input ref={(comp)=> (this.input_ref = comp)}
              placeholder={'search gif'}
              onKeyDown={this.onSearchSubmit}
            />
          </PickerBlock>

          <GridListOverflow>
            <GridList>
              {
                this.state.gifs.map((o,i) => (
                  <img key={`giphy-item-${i}`} onClick={(_e) => (this.props.handleSelected(o))}
                    height={o.images.fixed_width_downsampled.height}
                    width={o.images.fixed_width_downsampled.width}
                    src={o.images.fixed_width_downsampled.url}
                  />
                ))
              }
            </GridList>
          </GridListOverflow>
        </Container>
        <Attribution>
          <img src={attribution}/>
        </Attribution>
        {/* <Arrow/> */}
      </GiphyBlock>
    )
  }
}
