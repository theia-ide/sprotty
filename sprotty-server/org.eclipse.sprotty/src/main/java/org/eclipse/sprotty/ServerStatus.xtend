package org.eclipse.sprotty

import org.eclipse.xtend.lib.annotations.Data

@Data
class ServerStatus {
	enum Severity { ERROR, WARNING, INFO, OK }

	public static val OK = new ServerStatus(Severity.OK, '')
	
	Severity severity
	String message
}