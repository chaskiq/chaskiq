# from https://stackoverflow.com/questions/26828107/how-to-generate-a-random-name-in-ruby
class DummyName
  class Name < String
    class << self
      def sign
        "#{[*?A..?Z].sample}#{[*?A..?Z].sample}"
      end

      def number
        "#{rand 1..9}#{rand 0..9}#{rand 0..9}"
      end

      def new
        super << sign << number
      end
    end
  end
end