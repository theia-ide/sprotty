/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.json;

import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.TypeAdapter;
import com.google.gson.internal.bind.JsonTreeWriter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

/**
 * Gson type adapter that can determine the actual Java class to use for a JSON object based
 * on a discriminator property.
 */
public abstract class PropertyBasedTypeAdapter<T> extends TypeAdapter<T> {
	
	private final Gson gson;
	
	private final String discriminator;
	
	public PropertyBasedTypeAdapter(Gson gson, String discriminator) {
		this.gson = gson;
		this.discriminator = discriminator;
	}

	@Override
	public T read(JsonReader in) throws IOException {
		try {
			in.beginObject();
			T result = null;
			Map<String, JsonElement> unassignedProperties = null;
			while (in.hasNext()) {
				String propertyName = in.nextName();
				if (propertyName.equals(discriminator)) {
					if (result != null)
						throw new IllegalStateException("Property '" + discriminator + "' is defined twice.");
					result = createInstance(in.nextString());
					if (unassignedProperties != null) {
						for (Map.Entry<String, JsonElement> entry : unassignedProperties.entrySet()) {
							assignProperty(result, entry.getKey(), entry.getValue());
						}
					}
				} else if (result != null) {
					assignProperty(result, propertyName, in);
				} else {
					if (unassignedProperties == null)
						unassignedProperties = new HashMap<>();
					unassignedProperties.put(propertyName, toTree(in));
				}
			}
			in.endObject();
			return result;
		} catch (IllegalAccessException e) {
			throw new RuntimeException(e);
		}
	}
	
	protected abstract T createInstance(String parameter);
	
	protected void assignProperty(T instance, String propertyName, JsonReader in) throws IllegalAccessException {
		try {
			Field field = findField(instance.getClass(), propertyName);
			Object value = gson.fromJson(in, field.getGenericType());
			field.set(instance, value);
		} catch (NoSuchFieldException e) {
			// Ignore this property
		}
	}
	
	protected void assignProperty(T instance, String propertyName, JsonElement element) throws IllegalAccessException {
		try {
			Field field = findField(instance.getClass(), propertyName);
			Object value = gson.fromJson(element, field.getGenericType());
			field.set(instance, value);
		} catch (NoSuchFieldException e) {
			// Ignore this property
		}
	}
	
	protected Field findField(Class<?> type, String propertyName) throws NoSuchFieldException {
		try {
			Field field = type.getDeclaredField(propertyName);
			field.setAccessible(true);
			return field;
		} catch (NoSuchFieldException e) {
			Class<?> superType = type.getSuperclass();
			if (superType != null)
				return findField(superType, propertyName);
			else
				throw e;
		}
	}
	
	protected JsonElement toTree(JsonReader in) throws IOException {
		JsonTreeWriter writer = new JsonTreeWriter();
		transfer(in, writer);
		return writer.get();
	}
	
	protected void transfer(JsonReader in, JsonWriter out) throws IOException {
		JsonToken token = in.peek();
		switch (token) {
		case BEGIN_ARRAY:
			in.beginArray();
			out.beginArray();
			while (in.hasNext()) {
				transfer(in, out);
			}
			out.endArray();
			in.endArray();
			break;
			
		case BEGIN_OBJECT:
			in.beginObject();
			out.beginObject();
			while (in.hasNext()) {
				out.name(in.nextName());
				transfer(in, out);
			}
			out.endObject();
			in.endObject();
			break;
			
		case STRING:
			out.value(in.nextString());
			break;
			
		case NUMBER:
			out.value(in.nextDouble());
			break;
			
		case BOOLEAN:
			out.value(in.nextBoolean());
			break;
			
		case NULL:
			in.nextNull();
			out.nullValue();
			break;
			
		default:
			throw new IllegalStateException();
		}
	}

	@Override
	public void write(JsonWriter out, T value) throws IOException {
		if (value == null) {
			out.nullValue();
		} else {
			try {
				out.beginObject();
				Set<String> written = new HashSet<>();
				writeProperties(out, value, value.getClass(), written);
				if (!written.contains(discriminator))
					throw new RuntimeException("Object does not contain a field '" + discriminator + "'.");
				out.endObject();
			} catch (IllegalAccessException e) {
				throw new RuntimeException(e);
			}
		}
	}
	
	protected void writeProperties(JsonWriter out, T instance, Class<?> type, Set<String> written)
			throws IOException, IllegalAccessException {
		for (Field field : type.getDeclaredFields()) {
			int modifiers = field.getModifiers();
			if (!Modifier.isTransient(modifiers) && !Modifier.isStatic(modifiers)
					&& written.add(field.getName())) {
				writeProperty(out, instance, field);
			}
		}
		Class<?> superType = type.getSuperclass();
		if (superType != null) {
			writeProperties(out, instance, superType, written);
		}
	}
	
	protected void writeProperty(JsonWriter out, T instance, Field field) throws IOException, IllegalAccessException {
		field.setAccessible(true);
		out.name(field.getName());
		Object value = field.get(instance);
		if (value == null)
			out.nullValue();
		else if (value == instance)
			throw new RuntimeException("Object has a reference to itself.");
		else
			gson.toJson(value, value.getClass(), out);
	}

}
