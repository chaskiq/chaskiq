require "nokogiri"
require "rails_helper"

RSpec.describe Dante::Renderer do
  describe "#render" do
    let(:prosemirror_data) do
      {
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Hello, world!" }]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a " },
              { type: "text", marks: [{ type: "bold" }], text: "bold" },
              { type: "text", text: " text." }
            ]
          }
        ]
      }
    end

    it "renders the ProseMirror JSON data to HTML" do
      renderer = Dante::Renderer.new(raw: prosemirror_data)
      html_output = renderer.render

      parsed_html = Nokogiri::HTML(html_output)

      h1 = parsed_html.at_css("h1")
      expect(h1).not_to be_nil
      expect(h1.text).to eq("Hello, world!")

      p = parsed_html.at_css("p")
      expect(p).not_to be_nil
      expect(p.text).to eq("This is a bold text.")

      strong = parsed_html.at_css("strong")
      expect(strong).not_to be_nil
      expect(strong.text).to eq("bold")
    end

    it "renders file" do
      json = JSON.parse '{"type":"doc","content":[{"type":"paragraph"},{"type":"FileBlock","attrs":{"url":"blob:http://localhost:8080/fda338c3-79d5-4994-bb8a-8f1e6ebcfd52","src":null,"width":"","height":"","loading":true,"loading_progress":0,"caption":"caption!","direction":"center","file":{},"aspect_ratio":{"width":200,"height":200,"ratio":100}}}]}'
      data = ActiveSupport::HashWithIndifferentAccess.new(json)

      renderer = Dante::Renderer.new(raw: data)
      html_output = renderer.render

      parsed_html = Nokogiri::HTML(html_output)

      h1 = parsed_html.at_css("a")
      expect(h1).not_to be_nil
    end

    it "renders embed" do
      json = JSON.parse '{"type":"doc","content":[{"type":"paragraph"},{"type":"EmbedBlock","attrs":{"embed_data":{"error":"no matching providers found","url":"https://github.com/michelson"},"provisory_text":"https://github.com/michelson"},"content":[{"type":"text","marks":[{"type":"link","attrs":{"href":"https://github.com/michelson","target":"_blank","class":null}}],"text":"https://github.com/michelson"}]},{"type":"paragraph"}]}'
      data = ActiveSupport::HashWithIndifferentAccess.new(json)

      renderer = Dante::Renderer.new(raw: data)
      html_output = renderer.render

      parsed_html = Nokogiri::HTML(html_output)
      h1 = parsed_html.at_css("a")
      expect(h1).not_to be_nil
    end

    it "renders embed" do
      json = JSON.parse '{"type":"doc","content":[{"type":"paragraph"},{"type":"paragraph","content":[{"type":"text","text":"Hello"}]},{"type":"VideoBlock","attrs":{"embed_data":{"provider_url":"https://www.youtube.com/","height":113,"type":"video","html":"<iframe width=\"200\" height=\"113\" src=\"https://www.youtube.com/embed/SjhIlw3Iffs?feature=oembed\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen title=\"GPT-4 Creator Ilya Sutskever\"></iframe>","author_name":"Eye on AI","author_url":"https://www.youtube.com/@eyeonai3425","thumbnail_url":"https://i.ytimg.com/vi/SjhIlw3Iffs/hqdefault.jpg","title":"GPT-4 Creator Ilya Sutskever","thumbnail_width":480,"width":200,"provider_name":"YouTube","thumbnail_height":360,"version":"1.0","url":"https://www.youtube.com/watch?v=SjhIlw3Iffs"},"provisory_text":"https://www.youtube.com/watch?v=SjhIlw3Iffs"},"content":[{"type":"text","marks":[{"type":"link","attrs":{"href":"https://www.youtube.com/watch?v=SjhIlw3Iffs","target":"_blank","class":null}}],"text":"https://www.youtube.com/watch?v=SjhIlw3Iffs"}]},{"type":"paragraph","content":[{"type":"text","text":"hellok"}]},{"type":"paragraph"}]}'
      data = ActiveSupport::HashWithIndifferentAccess.new(json)

      renderer = Dante::Renderer.new(raw: data)
      html_output = renderer.render
      parsed_html = Nokogiri::HTML(html_output)
      h1 = parsed_html.at_css("iframe")
      expect(h1).not_to be_nil
    end

    it "image image" do
      json = JSON.parse '{"type":"doc","content":[{"type":"ImageBlock","attrs":{"url":"https://miro.medium.com/v2/resize:fit:1400/format:webp/1*cg_wdzpS-Me6_CQyL1pHiA.jpeg","src":null,"width":1686,"height":1580,"loading":true,"loading_progress":0,"caption":"caption!","direction":"center","file":{},"aspect_ratio":{"width":1000,"height":937.129300118624,"ratio":93.7129300118624}}}]}'
      data = ActiveSupport::HashWithIndifferentAccess.new(json)

      renderer = Dante::Renderer.new(raw: data)
      html_output = renderer.render
      parsed_html = Nokogiri::HTML(html_output)
      h1 = parsed_html.at_css("img")
      expect(h1).not_to be_nil
    end

    it "link marks" do
      json = JSON.parse '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"hola "},{"type":"text","marks":[{"type":"link","attrs":{"href":"http://fkfjfj.com","target":"_blank","class":null}}],"text":"http://fkfjfj.com"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"link","attrs":{"href":"http://google.com","target":"_blank","class":null}}],"text":"google.com"}]}]}'
      data = ActiveSupport::HashWithIndifferentAccess.new(json)

      renderer = Dante::Renderer.new(raw: data)
      html_output = renderer.render
      parsed_html = Nokogiri::HTML(html_output)
      h1 = parsed_html.at_css("a")
      expect(h1).not_to be_nil
    end

    it "link marks" do
      json = JSON.parse '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"helo"},{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"#d42323"}}],"text":"o"}]}]}'
      data = ActiveSupport::HashWithIndifferentAccess.new(json)

      renderer = Dante::Renderer.new(raw: data)
      html_output = renderer.render
      parsed_html = Nokogiri::HTML(html_output)
      puts html_output
      h1 = parsed_html.at_css("p")
      expect(h1).not_to be_nil
    end

    describe "converter" do
      it "it converts" do
        draft_content = '{"blocks":[{"key":"6176l","text":"okokokok","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":8,"style":"CUSTOM_COLOR_#ce4444"},{"offset":0,"length":8,"style":"BOLD"}],"entityRanges":[],"data":{}}],"entityMap":{}}'
        data = Dante::Converter.draftjs_to_prosemirror(draft_content)

        html = Dante::Renderer.new(raw: data).render
        parsed_html = Nokogiri::HTML(html)
        h1 = parsed_html.at_css("strong")
        expect(h1).not_to be_nil
      end

      it "basic styles" do
        draft_content = '{"blocks":[{"key":"6176l","text":"Heading 1","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9a19j","text":"heading 2","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"bv19a","text":"heading 3","type":"header-three","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"luso","text":"Blockquote","type":"blockquote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"20lot","text":"italic bold","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":11,"style":"ITALIC"},{"offset":7,"length":4,"style":"BOLD"}],"entityRanges":[],"data":{}}],"entityMap":{}}'
        data = Dante::Converter.draftjs_to_prosemirror(draft_content)
        html = Dante::Renderer.new(raw: data).render
        parsed_html = Nokogiri::HTML(html)

        puts html
        h1 = parsed_html.at_css("h1")
        expect(h1).not_to be_nil
        h1 = parsed_html.at_css("h3")
        expect(h1).not_to be_nil
        h1 = parsed_html.at_css("h3")
        expect(h1).not_to be_nil
        # puts html
      end

      it "lists" do
        draft_content = '{"blocks":[{"key":"6176l","text":"lists ","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"21a13","text":"dos","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"fmj34","text":"tres","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"46qi1","text":"otra","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"3be9j","text":"dos","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}'
        data = Dante::Converter.draftjs_to_prosemirror(draft_content)
        puts html = Dante::Renderer.new(raw: data).render
        parsed_html = Nokogiri::HTML(html)
        h1 = parsed_html.at_css("li")
        expect(h1).not_to be_nil
      end

      it "links" do
        draft_content = '{"blocks":[{"key":"6176l","text":"links","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":5,"key":0}],"data":{}}],"entityMap":{"0":{"type":"LINK","mutability":"MUTABLE","data":{"url":"http://chaskiq.io"}}}}'
        data = Dante::Converter.draftjs_to_prosemirror(draft_content)
        html = Dante::Renderer.new(raw: data).render

        parsed_html = Nokogiri::HTML(html)
        h1 = parsed_html.at_css("a")
        expect(h1).not_to be_nil
        puts html
      end

      it "images" do
        draft_content = '{"blocks":[{"key":"6176l","text":"","type":"image","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"aspect_ratio":{"width":0,"height":0,"ratio":100},"width":0,"caption":"type a caption (optional)","height":0,"forceUpload":false,"url":"blob:https://www.dante-editor.dev/9549a36d-23bb-4f0e-8555-ebd7eea0b8fe","loading_progress":0,"selected":false,"loading":false,"file":null,"direction":"center"}}],"entityMap":{}}'
        data = Dante::Converter.draftjs_to_prosemirror(draft_content)
        html = Dante::Renderer.new(raw: data).render
        parsed_html = Nokogiri::HTML(html)
        h1 = parsed_html.at_css("img")
        expect(h1).not_to be_nil
        puts html
      end
    end
  end
end
