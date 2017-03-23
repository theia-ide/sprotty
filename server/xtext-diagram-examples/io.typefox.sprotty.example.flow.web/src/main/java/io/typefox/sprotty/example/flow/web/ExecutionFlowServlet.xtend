package io.typefox.sprotty.example.flow.web

import javax.servlet.annotation.WebServlet
import org.eclipse.xtext.web.servlet.XtextServlet

/**
 * Deploy this class into a servlet container to enable DSL-specific services.
 */
@WebServlet(name = 'XtextServices', urlPatterns = '/xtext-service/*')
class ExecutionFlowServlet extends XtextServlet {
	
}
