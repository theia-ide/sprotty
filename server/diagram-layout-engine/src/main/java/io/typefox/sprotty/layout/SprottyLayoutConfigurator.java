/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.layout;

import java.util.Map;

import org.eclipse.elk.core.LayoutConfigurator;
import org.eclipse.elk.graph.ElkGraphElement;
import org.eclipse.elk.graph.properties.IPropertyHolder;
import org.eclipse.elk.graph.properties.MapPropertyHolder;

import com.google.common.collect.Maps;

public class SprottyLayoutConfigurator extends LayoutConfigurator {
	
    private final Map<String, MapPropertyHolder> idOptionMap = Maps.newHashMap();
    private final Map<String, MapPropertyHolder> typeOptionMap = Maps.newHashMap();
    
    public IPropertyHolder configureById(String id) {
        MapPropertyHolder result = idOptionMap.get(id);
        if (result == null) {
            result = new MapPropertyHolder();
            idOptionMap.put(id, result);
        }
        return result;
    }
    
    public final IPropertyHolder getPropertiesById(String id) {
        return idOptionMap.get(id);
    }
    
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
        IPropertyHolder idProperties = getPropertiesById(element.getIdentifier());
        IPropertyHolder typeProperties = getPropertiesByType(element.getProperty(ElkLayoutEngine.P_TYPE));
        // TODO consider option filter
        if (idProperties != null) {
            element.copyProperties(idProperties);
        }
        if (typeProperties != null) {
            element.copyProperties(typeProperties);
        }
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
