package io.typefox.sprotte.example.multicore.conversion

import com.google.inject.Inject
import org.eclipse.xtext.common.services.DefaultTerminalConverters
import org.eclipse.xtext.conversion.IValueConverter
import org.eclipse.xtext.conversion.ValueConverter

class MulticoreAllocationValueConverterService extends DefaultTerminalConverters {
	
	@Inject IntegerValueConverter integerValueconverter
	
	@ValueConverter(rule = "Integer")
	def IValueConverter<Integer> Integer() {
		integerValueconverter
	}
	
}