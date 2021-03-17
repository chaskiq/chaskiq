module EuCountries

	def includes?(country_code)
		%w[
			DE AT BE BG CY HR DK ES EE FI FR GR HU IE
			IT LV LT LU MT NL PL PT CZ RO GB SK SI SE
		].include?(country_code)
	end
end