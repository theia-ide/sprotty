package io.typefox.sprotty.server.json;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.TypeAdapter;
import com.google.gson.internal.bind.JsonTreeWriter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

public abstract class PropertyBasedTypeAdapter<T> extends TypeAdapter<T> {
	
	private final Gson gson;
	
	private final String discriminator;
	
	public PropertyBasedTypeAdapter(Gson gson, String discriminator) {
		this.gson = gson;
		this.discriminator = discriminator;
	}

	@Override
	public T read(JsonReader in) throws IOException {
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
	}
	
	protected abstract T createInstance(String parameter);
	
	protected void assignProperty(T instance, String propertyName, JsonReader in) {
		try {
			Field field = instance.getClass().getDeclaredField(propertyName);
			field.setAccessible(true);
			Object value = gson.fromJson(in, field.getGenericType());
			field.set(instance, value);
		} catch (Exception e) {
			// Ignore this property
		}
	}
	
	protected void assignProperty(T instance, String propertyName, JsonElement element) {
		try {
			Field field = instance.getClass().getDeclaredField(propertyName);
			field.setAccessible(true);
			Object value = gson.fromJson(element, field.getGenericType());
			field.set(instance, value);
		} catch (Exception e) {
			// Ignore this property
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
			Class<?> type = value.getClass();
			try {
				type.getDeclaredField(discriminator);
			} catch (NoSuchFieldException e) {
				throw new RuntimeException("Object does not contain a field '" + discriminator + "'.", e);
			}
			gson.toJson(value, type, out);
		}
	}

}
