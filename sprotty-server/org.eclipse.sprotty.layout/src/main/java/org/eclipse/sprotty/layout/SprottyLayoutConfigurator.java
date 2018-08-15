/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
package org.eclipse.sprotty.layout;

import java.util.Map;
import java.util.regex.Pattern;

import org.eclipse.elk.core.LayoutConfigurator;
import org.eclipse.elk.graph.ElkGraphElement;
import org.eclipse.elk.graph.properties.IPropertyHolder;
import org.eclipse.elk.graph.properties.MapPropertyHolder;

import com.google.common.collect.Maps;

/**
 * Specialized {@link LayoutConfigurator} that can configure layout options based on the {@code id}
 * and {@code type} attributes of sprotty model elements.
 */
public class SprottyLayoutConfigurator extends LayoutConfigurator {
	
	private static Pattern ID_REPLACE_PATTERN = Pattern.compile("\\W|^\\d");
	
	public static String toElkId(String sprottyId) {
		if (sprottyId == null || sprottyId.isEmpty())
			return null;
		else
			return ID_REPLACE_PATTERN.matcher(sprottyId).replaceAll("_");
	}
	
    private final Map<String, MapPropertyHolder> idOptionMap = Maps.newHashMap();
    private final Map<String, MapPropertyHolder> typeOptionMap = Maps.newHashMap();
    
    /**
     * Configure layout options for the model element with the given id.
     */
    public IPropertyHolder configureById(String id) {
    	String replacedId = toElkId(id);
        MapPropertyHolder result = idOptionMap.get(replacedId);
        if (result == null) {
            result = new MapPropertyHolder();
            idOptionMap.put(replacedId, result);
        }
        return result;
    }
    
    public final IPropertyHolder getPropertiesById(String id) {
        return idOptionMap.get(toElkId(id));
    }
    
    /**
     * Configure layout options for all model elements with the given type.
     */
    public IPropertyHolder configureByType(String type) {
    	MapPropertyHolder result = typeOptionMap.get(type);
    	if (result == null) {
    		result = new MapPropertyHolder();
    		typeOptionMap.put(type, result);
    	}
    	return result;
    }
    
    public final IPropertyHolder getPropertiesByType(String type) {
        return typeOptionMap.get(type);
    }
    
    @Override
    public void visit(final ElkGraphElement element) {
        super.visit(element);
        IPropertyHolder typeProperties = getPropertiesByType(element.getProperty(ElkLayoutEngine.P_TYPE));
        applyProperties(element, typeProperties);
        IPropertyHolder idProperties = getPropertiesById(element.getIdentifier());
        applyProperties(element, idProperties);
    }
    
    @Override
    public LayoutConfigurator overrideWith(LayoutConfigurator other) {
    	if (other instanceof SprottyLayoutConfigurator)
    		return this.overrideWith((SprottyLayoutConfigurator) other);
    	else
    		return super.overrideWith(other);
    }
    
    public SprottyLayoutConfigurator overrideWith(SprottyLayoutConfigurator other) {
    	super.overrideWith(other);
        for (Map.Entry<String, MapPropertyHolder> entry : other.idOptionMap.entrySet()) {
            MapPropertyHolder thisHolder = this.idOptionMap.get(entry.getKey());
            if (thisHolder == null) {
                thisHolder = new MapPropertyHolder();
                this.idOptionMap.put(entry.getKey(), thisHolder);
            }
            thisHolder.copyProperties(entry.getValue());
        }
        for (Map.Entry<String, MapPropertyHolder> entry : other.typeOptionMap.entrySet()) {
        	MapPropertyHolder thisHolder = this.typeOptionMap.get(entry.getKey());
        	if (thisHolder == null) {
        		thisHolder = new MapPropertyHolder();
        		this.typeOptionMap.put(entry.getKey(), thisHolder);
        	}
        	thisHolder.copyProperties(entry.getValue());
        }
        return this;
    }

}
