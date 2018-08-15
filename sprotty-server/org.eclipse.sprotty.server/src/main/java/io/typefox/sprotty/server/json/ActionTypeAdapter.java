/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.json;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.TypeAdapter;
import com.google.gson.TypeAdapterFactory;
import com.google.gson.reflect.TypeToken;

import io.typefox.sprotty.api.Action;
import io.typefox.sprotty.api.CenterAction;
import io.typefox.sprotty.api.CollapseExpandAction;
import io.typefox.sprotty.api.CollapseExpandAllAction;
import io.typefox.sprotty.api.ComputedBoundsAction;
import io.typefox.sprotty.api.ExportSvgAction;
import io.typefox.sprotty.api.FitToScreenAction;
import io.typefox.sprotty.api.OpenAction;
import io.typefox.sprotty.api.RequestBoundsAction;
import io.typefox.sprotty.api.RequestExportSvgAction;
import io.typefox.sprotty.api.RequestModelAction;
import io.typefox.sprotty.api.RequestPopupModelAction;
import io.typefox.sprotty.api.SelectAction;
import io.typefox.sprotty.api.SelectAllAction;
import io.typefox.sprotty.api.SetBoundsAction;
import io.typefox.sprotty.api.SetModelAction;
import io.typefox.sprotty.api.SetPopupModelAction;
import io.typefox.sprotty.api.UpdateModelAction;

/**
 * Gson type adapter for sprotty actions.
 */
public class ActionTypeAdapter extends PropertyBasedTypeAdapter<Action> {
	
	/**
	 * Configure a Gson builder with the default sprotty actions. If you need to register your own action
	 * classes, create an instance of {@link Factory} instead and call {@link Factory#addActionKind(String, Class)}.
	 */
	public static GsonBuilder configureGson(GsonBuilder gsonBuilder) {
		gsonBuilder
				.registerTypeAdapterFactory(new ActionTypeAdapter.Factory())
				.registerTypeAdapterFactory(new EnumTypeAdapter.Factory());
		return gsonBuilder;
	}
	
	/**
	 * Type adapter factory for sprotty actions. Action classes are registered via their {@code kind}
	 * attribute using {@link #addActionKind(String, Class)}.
	 */
	public static class Factory implements TypeAdapterFactory {
		
		private final Map<String, Class<? extends Action>> actionKinds = new HashMap<>();
		
		public Factory() {
			addDefaultActionKinds();
		}
		
		protected void addDefaultActionKinds() {
			addActionKind(RequestModelAction.KIND, RequestModelAction.class);
			addActionKind(SetModelAction.KIND, SetModelAction.class);
			addActionKind(UpdateModelAction.KIND, UpdateModelAction.class);
			addActionKind(RequestBoundsAction.KIND, RequestBoundsAction.class);
			addActionKind(ComputedBoundsAction.KIND, ComputedBoundsAction.class);
			addActionKind(SetBoundsAction.KIND, SetBoundsAction.class);
			addActionKind(SelectAction.KIND, SelectAction.class);
			addActionKind(SelectAllAction.KIND, SelectAllAction.class);
			addActionKind(CenterAction.KIND, CenterAction.class);
			addActionKind(FitToScreenAction.KIND, FitToScreenAction.class);
			addActionKind(RequestPopupModelAction.KIND, RequestPopupModelAction.class);
			addActionKind(SetPopupModelAction.KIND, SetPopupModelAction.class);
			addActionKind(CollapseExpandAction.KIND, CollapseExpandAction.class);
			addActionKind(CollapseExpandAllAction.KIND, CollapseExpandAllAction.class);
			addActionKind(OpenAction.KIND, OpenAction.class);
			addActionKind(RequestExportSvgAction.KIND, RequestExportSvgAction.class);
			addActionKind(ExportSvgAction.KIND, ExportSvgAction.class);
		}
		
		public void addActionKind(String kind, Class<? extends Action> clazz) {
			actionKinds.put(kind, clazz);
		}
		
		@Override
		@SuppressWarnings("unchecked")
		public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> typeToken) {
			if (!Action.class.isAssignableFrom(typeToken.getRawType()))
				return null;
			return (TypeAdapter<T>) new ActionTypeAdapter(gson, actionKinds);
		}
	}
	
	private final Map<String, Class<? extends Action>> actionKinds;
	
	public ActionTypeAdapter(Gson gson, Map<String, Class<? extends Action>> actionKinds) {
		super(gson, "kind");
		this.actionKinds = actionKinds;
	}

	@Override
	protected Action createInstance(String kind) {
		Class<? extends Action> clazz = actionKinds.get(kind);
		if (clazz == null)
			throw new IllegalArgumentException("Unknown action kind: " + kind);
		try {
			Constructor<? extends Action> constructor = clazz.getConstructor();
			return constructor.newInstance();
		} catch (NoSuchMethodException e) {
			throw new RuntimeException("Action class does not have a default constructor.", e);
		} catch (Exception e) {
			throw new RuntimeException("Unable to invoke action constructor", e);
		}
	}
	
}
