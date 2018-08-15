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
package org.eclipse.sprotty.server.json;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.TypeAdapter;
import com.google.gson.TypeAdapterFactory;
import com.google.gson.reflect.TypeToken;

import org.eclipse.sprotty.Action;
import org.eclipse.sprotty.CenterAction;
import org.eclipse.sprotty.CollapseExpandAction;
import org.eclipse.sprotty.CollapseExpandAllAction;
import org.eclipse.sprotty.ComputedBoundsAction;
import org.eclipse.sprotty.ExportSvgAction;
import org.eclipse.sprotty.FitToScreenAction;
import org.eclipse.sprotty.OpenAction;
import org.eclipse.sprotty.RequestBoundsAction;
import org.eclipse.sprotty.RequestExportSvgAction;
import org.eclipse.sprotty.RequestModelAction;
import org.eclipse.sprotty.RequestPopupModelAction;
import org.eclipse.sprotty.SelectAction;
import org.eclipse.sprotty.SelectAllAction;
import org.eclipse.sprotty.SetBoundsAction;
import org.eclipse.sprotty.SetModelAction;
import org.eclipse.sprotty.SetPopupModelAction;
import org.eclipse.sprotty.UpdateModelAction;

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
