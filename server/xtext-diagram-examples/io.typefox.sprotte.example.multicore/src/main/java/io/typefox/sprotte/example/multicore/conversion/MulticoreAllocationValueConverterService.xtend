package io.typefox.sprotte.example.multicore.conversion

import org.eclipse.xtext.common.services.DefaultTerminalConverters
import org.eclipse.xtext.conversion.ValueConverter
import org.eclipse.xtext.conversion.IValueConverter

class MulticoreAllocationValueConverterService extends DefaultTerminalConverters {
	
	@ValueConverter(rule = "Integer")
	def IValueConverter<Integer> Integer() {
		// Use the same value converter as the INT rule, but convert to Integer instead of primitive int
		INT
	}
	
}