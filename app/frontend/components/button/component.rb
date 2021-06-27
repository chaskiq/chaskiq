# frozen_string_literal: true

class Button::Component < ApplicationViewComponent
	def initialize(variant: '', size: '', data: {}, type: 'button')
    @variant = variant_class(variant)
    @size = size_class(size)
    @data = data_attributes(data)
    @type = type
  end

  def size_class(size)
    case size
    when 'xs'
      "px-2 py-1 text-xs font-medium "
    when 'sm', 'small'
      "px-2.5 py-1.5 text-xs leading-4"
    when 'md', 'medium'
      "px-4 py-2 text-sm leading-7 font-medium uppercase"
    when 'lg', 'large'
      'px-8 py-4 text-xl font-light uppercase'
    else
      #if (props.variant === 'icon') {
      #  return tw`p-1`
      'px-2 py-1 text-sm font-medium leading-7'
    end
  end

  def variant_class(variant)
    case variant
    when 'success'
      """
        outline-none 
        rounded-md 
        bg-green-400 
        text-white
        hover:bg-green-500 
        focus:outline-none 
        focus:border-green-700 
        focus:shadow-outline
      """
    when 'flat'
      """
        inline-flex 
        items-center 
        border 
        border-transparent 
        text-xs 
        font-medium 
        rounded 
        text-indigo-700 
        bg-indigo-100 
        hover:bg-indigo-200 
        focus:outline-none 
      """
    when 'flat-dark'
      """
          flex
          items-center
          border 
          border-transparent 
          rounded 
          text-gray-100 
          bg-gray-900 
          hover:bg-gray-800 
          focus:outline-none 
          focus:border-gray-700 
          active:bg-gray-800 
      """
    when 'main'
      """
      outline-none 
        inline-flex 
        items-center 
        border 
        border-transparent 
        rounded-md 
        text-white bg-indigo-600 
        hover:bg-indigo-500 
        focus:outline-none 
        focus:shadow-outline 
        focus:border-indigo-700 
        active:bg-indigo-700
      """
    when'link'
      """
        flex text-indigo-700 hover:text-indigo-900 inline-flex items-center
      """
    when'clean'
        ''
    when 'outlined'
      """
        flex 
        items-center
        inline-flex 
        justify-center 
        px-4 
        py-2 
        border 
        border-gray-300 
        shadow-sm 
        text-sm 
        font-medium 
        rounded-md 
        text-gray-700 
        dark:bg-black

        bg-white 
        hover:bg-gray-50 

        dark:text-gray-100 
        dark:hover:bg-gray-900

        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-pink-500
      """
    when 'outlined-transparent'
      """
        flex 
        items-center
        inline-flex 
        justify-center 
        px-4 
        py-2 
        border 
        border-gray-900 
        shadow-sm 
        text-sm 
        font-medium 
        rounded-md 
        text-gray-100
        bg-transparent
        hover:text-gray-800 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-pink-500
      """
    when 'icon'
      """
        outline-none 
        rounded-full 
        p-1 
        bg-transparent
        hover:text-gray-400
      """
    when 'danger'
      """
        outline-none 
        rounded 
        bg-red-400 
        text-white
        hover:bg-red-500 
        focus:outline-none 
        focus:border-red-700 
        focus:shadow-outline
      """
    else
      """
        flex 
        flex-wrap 
        items-center
        rounded
        border 
        border-transparent 
        text-indigo-700 
        dark:bg-white
        dark:text-gray-900
        dark:hover:text-gray-600
        dark:hover:bg-gray-200
        bg-indigo-100 
        hover:bg-indigo-200
        focus:outline-none 
        focus:border-indigo-300 
        active:bg-indigo-200
      """
    end
  end

  def data_attributes(data)
    data.map{ |k,v| "data-#{k}=#{v}" }.join(" ")
  end
end
