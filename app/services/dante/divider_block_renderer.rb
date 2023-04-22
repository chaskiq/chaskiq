class Dante::DividerBlockRenderer
  def initialize(block_key:, data:, domain: nil)
    @block_key = block_key
    @data = data
    @domain = domain
  end

  def render
    divider = <<~HTML
      <div class="graf graf--divider is-selected">
        <span></span>
      </div>
    HTML

    divider.strip
  end
end
