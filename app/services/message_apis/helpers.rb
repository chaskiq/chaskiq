module MessageApis
  module Helpers

    extend ActiveSupport::Concern

    def keygen
      ('a'..'z').to_a.shuffle[0,8].join
    end

    def text_block(text)
      lines = text.split("\n").delete_if(&:empty?)
      {
        "blocks": lines.map{|o| serialized_block(o)} ,
        "entityMap":{}
      }.to_json
    end

    def gif_block(title: , url:)
      {
        "key": keygen,
        "text": title,
        "type": "recorded-video",
        "depth": 0,
        "inlineStyleRanges": [],
        "entityRanges": [],
        "data": {
          "rejectedReason": "",
          "secondsLeft": 0,
          "fileReady": true,
          "paused": false,
          "url": url,
          "recording": false,
          "granted": true,
          "loading": false,
          "direction": "center"
        }
      }
    end

    def photo_block(url:, title:, w:, h:)
      {
        "key": keygen,
        "text": title,
        "type":"image",
        "depth":0,
        "inlineStyleRanges":[],
        "entityRanges":[],
        "data":{
          "aspect_ratio":{
            "width": w.to_i,
            "height": h.to_i,
            "ratio":100
          },
          "width": w.to_i,
          "height": h.to_i,
          "caption": title,
          "forceUpload":false,
          "url": url,
          "loading_progress":0,
          "selected":false,
          "loading":true,
          "file":{},
          "direction":"center"
        }
      }
    end

    def file_block(url:, text:)
      {
        "key": keygen,
        "text": text,
        "type":"file",
        "depth":0,
        "inlineStyleRanges":[],
        "entityRanges":[],
        "data":{
          "caption": text,
          "forceUpload":false,
          "url": url,
          "loading_progress":0,
          "selected":false,
          "loading":true,
          "file":{},
          "direction":"center"
        }
      }
    end

    def serialized_block(text)
      {
        "key": keygen,
        "text": text,
        "type":"unstyled",
        "depth":0,
        "inlineStyleRanges":[],
        "entityRanges":[],
        "data":{}
      }
    end

  end
end