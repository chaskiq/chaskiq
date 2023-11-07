class Apps::SecurityController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def index
    authorize! @app, to: :can_read_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    @default_code_lang = params[:code_lang] || "ruby"

    @showkey = true if params[:show]

    @encryption_key = @showkey ? @app.encryption_key : "*******"

    @key_options = key_gen_options.find { |o| o[:id] == @default_code_lang }
    @script = setup_script
  end

  private

  def key_gen_options
    [
      {
        title: "Ruby",
        description: "ruby",
        id: "ruby",
        state: "archived",
        code: %{
				OpenSSL::HMAC.hexdigest(
					'sha256', # hash function
					'#{@encryption_key}', # secret key (keep safe!)
					current_user.email
				)}
      },
      {
        title: "NodeJs",
        description: "nodejs",
        id: "nodejs",
        code: %{
				const crypto = require('crypto');
				const hmac = crypto.createHmac('sha256', '#{@encryption_key}');
				hmac.update('Message');
				console.log(hmac.digest('hex'));`,
			}
      },
      {
        title: "PHP",
        description: "PHP",
        id: "php",
        code: %{
				hash_hmac(
					'sha256', // hash function
					$user->email, // user's id
					'#{@encryption_key}' // secret key (keep safe!)
				);}
      },
      {
        title: "Python 3",
        description: "python",
        id: "python",
        code: %{
				import hmac
				import hashlib
				hmac.new(
					b'#{@encryption_key}', # secret key (keep safe!)
					bytes(request.user.id, encoding='utf-8'), # user's id
					digestmod=hashlib.sha256 # hash function
				).hexdigest()
				}
      },
      {
        title: "Golang",
        description: "golang",
        id: "golang",
        code: %{
				package main

				import (
						"crypto/hmac"
						"crypto/sha256"
						"encoding/hex"
						"fmt"
				)

				func ComputeHmac256(message string, secret string) string {
						key := []byte(secret)
						h := hmac.New(sha256.New, key)
						h.Write([]byte(message))
						return hex.EncodeToString(h.Sum(nil))
				}

				func main() {
						fmt.Println(ComputeHmac256("Message", "secret")) // #{@encryption_key}
				}

				}
      }
    ]
  end

  def setup_script
    hostname = ENV.fetch("HOST", nil)
    ws_hostname = ENV.fetch("WS", nil)

    code = %{
        (function(d,t) {
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src="#{hostname}/embed.js"
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            new window.ChaskiqMessengerEncrypted({
              domain: '#{hostname}',
              ws:  '#{ws_hostname}',
              app_id: "#{@app.key}",
              data: {
                email: "user@email.com",
                identifier_key: "INSERT_HMAC_VALUE_HERE",
                properties: { }
              },
              lang: "USER_LANG_OR_DEFAULTS_TO_BROWSER_LANG"
            })
          }
        })(document,"script");
		}
  end
end
