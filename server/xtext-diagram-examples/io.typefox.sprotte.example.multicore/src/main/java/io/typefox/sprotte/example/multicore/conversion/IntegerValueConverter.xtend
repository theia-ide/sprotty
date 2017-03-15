package io.typefox.sprotte.example.multicore.conversion

import org.eclipse.xtext.conversion.ValueConverterException
import org.eclipse.xtext.conversion.impl.AbstractValueConverter
import org.eclipse.xtext.nodemodel.INode

class IntegerValueConverter extends AbstractValueConverter<Integer> {
	
	override toString(Integer value) throws ValueConverterException {
		if (value === null)
			throw new ValueConverterException("Integer value must not be null.", null, null)
		return value.toString
	}
	
	override toValue(String string, INode node) throws ValueConverterException {
		if (string.nullOrEmpty)
			throw new ValueConverterException("Couldn't convert empty string to an Integer value.", node, null)
		try {
			return Integer.valueOf(string)
		} catch (NumberFormatException e) {
			throw new ValueConverterException("Couldn't convert " + string + " to an Integer value.", node, e)
		}
	}
	
}