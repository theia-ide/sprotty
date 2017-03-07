package io.typefox.sprotte.protocolgen

import java.util.Date
import java.util.List
import java.util.Map
import java.util.Set
import org.eclipse.lsp4j.generator.JsonRpcData
import org.eclipse.lsp4j.jsonrpc.messages.Either
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonRequest
import org.eclipse.lsp4j.jsonrpc.services.JsonSegment
import org.eclipse.lsp4j.jsonrpc.validation.NonNull
import org.eclipse.xtend.lib.annotations.Delegate
import org.eclipse.xtend.lib.annotations.FinalFieldsConstructor
import org.eclipse.xtend.lib.macro.AbstractInterfaceProcessor
import org.eclipse.xtend.lib.macro.Active
import org.eclipse.xtend.lib.macro.CodeGenerationContext
import org.eclipse.xtend.lib.macro.declaration.AnnotationTarget
import org.eclipse.xtend.lib.macro.declaration.ClassDeclaration
import org.eclipse.xtend.lib.macro.declaration.Element
import org.eclipse.xtend.lib.macro.declaration.EnumerationTypeDeclaration
import org.eclipse.xtend.lib.macro.declaration.FieldDeclaration
import org.eclipse.xtend.lib.macro.declaration.InterfaceDeclaration
import org.eclipse.xtend.lib.macro.declaration.MemberDeclaration
import org.eclipse.xtend.lib.macro.declaration.MethodDeclaration
import org.eclipse.xtend.lib.macro.declaration.TypeDeclaration
import org.eclipse.xtend.lib.macro.declaration.TypeReference

@Active(JsonRpcGenerator)
annotation JsonRPC {
}

class JsonRpcGenerator extends AbstractInterfaceProcessor {
    
    override doGenerateCode(List<? extends InterfaceDeclaration> elements, extension CodeGenerationContext context) {
        val cu = elements.head.compilationUnit
        val importedTypes = <String>newLinkedHashSet()
        val (String)=>String importHook = [
            importedTypes += it
            return it
        ]
        val generatorContext = new JsonRPCGeneratorContext(context)
        val mainContents = '''
            «FOR intf : elements»

                «toServiceInterface(intf, importHook, generatorContext)»

                «toServiceClass(intf, importHook, generatorContext)»

                «toServiceNameSpace(intf, importHook)»
            «ENDFOR»
            
            // RPC method definitions
            «FOR intf : elements»
                «toRpcMethodDefinitions(intf, importHook, generatorContext)»
            «ENDFOR»
            
            // param and result definitions
            «FOR intf : elements»
                «FOR m : intf.declaredMethods»
                    «FOR p : m.parameters»
                        «generateDataStructure(p.type.type, generatorContext)»
                    «ENDFOR»
                    «IF !m.returnType.isVoid && m.returnType?.actualTypeArguments?.head?.upperBound !== null»
                        «generateDataStructure(m.returnType.actualTypeArguments.head.upperBound, generatorContext)»
                    «ENDIF»
                «ENDFOR»
            «ENDFOR»
        '''
        
        val name = cu.filePath.lastSegment
        val target = cu.filePath.projectFolder.append("src/main/ts/"+name.substring(0, name.length - 6)+".ts")
        target.contents = '''
            // this file is generated from «cu.filePath»
            import {
                «importedTypes.toList.sortBy[it].join(", ")»
            } from 'vscode-jsonrpc';
            «mainContents»
        '''
    }
    
    private def boolean isNotification(MethodDeclaration m) {
        return m.returnType.simpleName == 'void'
    }
    
    private def String getResultType(MethodDeclaration m, extension JsonRPCGeneratorContext context) {
        val returnType = m.returnType?.actualTypeArguments?.head?.upperBound
        if (returnType === null || Void.findTypeGlobally.isAssignableFrom(returnType.type)) {
            return 'void'
        }
        return returnType.simpleName
    }
    
    private def String getJsonRpcMethodName(MethodDeclaration m) {
        val prefix = m.declaringType.annotationValue(JsonSegment)
        val localName = m.annotationValue(JsonNotification) ?: m.annotationValue(JsonRequest) ?: m.simpleName
        if (prefix !== null) {
            return prefix + "/" + localName
        }
        return localName
    }
    
    def private String annotationValue(AnnotationTarget it, Class<?> annotation) {
        val value = annotations.findFirst[annotationTypeDeclaration.simpleName == annotation.simpleName]?.getValue("value")?.toString
        if (value.isNullOrEmpty)
            return null
        return value
    }

    private def String tsType(TypeReference ref, extension JsonRPCGeneratorContext context) {
        val tsType = ref.tsType
        if (tsType !== null) {
            return tsType
        }
        if (ref.isEither(context)) {
            return ref.leftType.tsType(context) + ' | ' + ref.rightType.tsType(context)
        }
        if (List.findTypeGlobally.isAssignableFrom(ref.type)) {
            return ref.tsArrayType(context)
        }
        if (Boolean.findTypeGlobally.isAssignableFrom(ref.type)) {
            return 'boolean'
        }
        if (Date.findTypeGlobally.isAssignableFrom(ref.type)) {
            return 'Date'
        }
        if (Number.findTypeGlobally.isAssignableFrom(ref.type)) {
            return 'number'
        }
        if (ref.isString(context)) {
            return 'string'
        }
        if (ref.isTsMap(context)) {
            return generateTsMapTypeBody(ref, context).toString
        }
        if (Map.findTypeGlobally.isAssignableFrom(ref.type)) {
            return 'Object'
        }
        return ref.simpleName
    }
    
    protected def boolean isTsMap(TypeReference ref, extension JsonRPCGeneratorContext context) {
        return Map.findTypeGlobally.isAssignableFrom(ref.type) && ref.leftType.isStringOrNumber(context)
    }

    protected def boolean isStringOrNumber(TypeReference ref, extension JsonRPCGeneratorContext context) {
        if (ref.isNumber(context)) {
            return true
        }
        if (ref.isString(context)) {
            return true
        }
        if (ref.isEither(context)) {
            return ref.leftType.isStringOrNumber(context) && ref.rightType.isStringOrNumber(context)
        }
        return false
    }
    
    protected def boolean isNumber(TypeReference ref, extension JsonRPCGeneratorContext context) {
        return Number.findTypeGlobally.isAssignableFrom(ref.type) || Enum.findTypeGlobally.isAssignableFrom(ref.type)
    }

    protected def boolean isString(TypeReference ref, extension JsonRPCGeneratorContext context) {
        return String.findTypeGlobally.isAssignableFrom(ref.type) || Character.findTypeGlobally.isAssignableFrom(ref.type)
    }
    
    protected def String tsArrayType(TypeReference ref, extension JsonRPCGeneratorContext context) {
        val elementType = ref.leftType
        var elementTsType = elementType.tsType(context)
        elementTsType = if(elementType.isEither(context)) '(' + elementTsType + ')' else elementTsType
        return elementTsType + "[]"
    }
    
    protected def TypeReference getLeftType(TypeReference ref) {
        return ref.actualTypeArguments.head
    }
    
    protected def TypeReference getRightType(TypeReference ref) {
        return ref.actualTypeArguments.last
    }
    
    protected def boolean isEither(TypeReference ref, extension JsonRPCGeneratorContext context) {
        return Either.findTypeGlobally.isAssignableFrom(ref.type)
    }

    protected def dispatch CharSequence generateDataStructure(Element t, extension JsonRPCGeneratorContext context) {
        return ""
    }
    
    protected def dispatch CharSequence generateDataStructure(TypeReference ref, extension JsonRPCGeneratorContext context) {
        val arguments = ref.actualTypeArguments
        if (arguments.empty) {
            return generateDataStructure(ref.type, context)
        }
        return '''
            «FOR type:arguments»
            «generateDataStructure(type, context)»
            «ENDFOR»
        '''
    }
    
    protected def dispatch CharSequence generateDataStructure(EnumerationTypeDeclaration t, extension JsonRPCGeneratorContext context) {
        if (!t.markAsHandled)
            return ""
        return '''
        
        «t.tsComment»
        export namespace «t.simpleName» {
            «FOR f : t.declaredValues.indexed»
            «f.value.tsComment»
            export const «f.value.simpleName» = «f.key»;
            «ENDFOR»
        }
        
        «t.tsComment»
        export type «t.simpleName» = «t.declaredValues.indexed.map[key].join(' | ')»;
        '''
    }

    protected def dispatch CharSequence generateDataStructure(ClassDeclaration t, extension JsonRPCGeneratorContext context) {
        if (!t.markAsHandled || !t.annotations.exists[annotationTypeDeclaration?.simpleName != JsonRpcData.simpleName])
            return ""
        t.tsType = t.simpleName
        val extendedType = t.extendedClass.type
        return '''
            «generateDataStructure(extendedType, context)»
            «FOR field : t.declaredFields»
                «generateDataStructure(field, context)»
            «ENDFOR»

            «t.tsComment»
            export interface «t.tsType»«IF extendedType.tsType !== null» extends «extendedType.tsType»«ENDIF» {
                «FOR f : t.declaredFields»
                    «f.tsComment»
                    «f.simpleName»«f.optionality»: «f.type.tsType(context)»;
                «ENDFOR»
            }
        '''
    }
    
    protected def dispatch CharSequence generateDataStructure(FieldDeclaration field, extension JsonRPCGeneratorContext context) {
        val type = field.type
        if (List.findTypeGlobally.isAssignableFrom(type.type)) {
            val elementType = type.leftType
            if (elementType.isTsMap(context)) {
                val fieldName = field.simpleName
                val name = fieldName.substring(0, fieldName.length - 1)
                return generateTsMapType(name, elementType, context)
            }
        }
        if (type.isTsMap(context)) {
            return generateTsMapType(field.simpleName, type, context)
        }
        return generateDataStructure(type, context)
    }

    protected def CharSequence generateTsMapType(String fieldName, TypeReference type, extension JsonRPCGeneratorContext context) {
        // FIXME generate unique ts type name, check that such name does not exist yet
        val name = fieldName.toFirstUpper
        type.setTsType(name)
        return '''
            «generateDataStructure(type, context)»

            export interface «name» «type.generateTsMapTypeBody(context)»
        '''
    }
    
    protected def CharSequence generateTsMapTypeBody(TypeReference type, extension JsonRPCGeneratorContext context) {
        '''
        {
            [propName: «type.leftType.tsType(context)»]: «type.rightType.tsType(context)»;
        }'''
    }
    
    def tsComment(MemberDeclaration it) {
        if (docComment !== null) {
            return '''
                /**
                 * «docComment.replace("\n","\n* ")»
                 */'''
        }
        return '';
    }
    
    def String optionality(FieldDeclaration f) {
        if (f.annotations.exists[annotationTypeDeclaration.simpleName == NonNull.simpleName]) {
            return ''
        } else {
            return '?'
        }
    }
    
    def String serviceInterface(InterfaceDeclaration it) {
        "I"+simpleName
    }
    def String serviceClass(InterfaceDeclaration it) {
        simpleName
    }
    def String serviceNamespace(InterfaceDeclaration it) {
        simpleName
    }
    
    def toRpcMethodDefinitions(InterfaceDeclaration intf, (String)=>String imports, extension JsonRPCGeneratorContext context) '''
        «FOR m : intf.declaredMethods»
            «m.tsComment»
            «IF m.isNotification»
                export namespace «m.simpleName.toFirstUpper»Notification {
                    export const type = new «imports.apply('NotificationType'+m.parameters.size)»<«m.parameters.map[type.tsType(context) + ", "].join»void>('«m.jsonRpcMethodName»');
                }
            «ELSE» 
                export namespace «m.simpleName.toFirstUpper»Request {
                    export const type = new «imports.apply('RequestType'+m.parameters.size)»<«m.parameters.map[type.tsType(context) + ", "].join»«m.getResultType(context)», void, void>('«m.jsonRpcMethodName»');
                }
            «ENDIF»
        «ENDFOR»
    '''
    
    def toServiceNameSpace(InterfaceDeclaration intf, (String)=>String imports) '''
        export namespace «intf.serviceNamespace» {
            export function connect(connection: «imports.apply('MessageConnection')», target: «intf.serviceInterface»): void {
                «FOR m : intf.declaredMethods.filter[!isNotification]»
                    connection.onRequest("«m.jsonRpcMethodName»", 
                        («m.parameters.map[simpleName+", "].join»cancelToken) => {
                            return target.«m.simpleName»(«m.parameters.map[simpleName+", "].join»cancelToken)
                        });
                «ENDFOR»
            }
            «IF intf.declaredMethods.exists[isNotification]»

            export function connectNotifications(connection: IConnection, target: «intf.serviceInterface»): Disposable {
                const notificationsHandler: NotificationsHandler = {}
                «FOR m : intf.declaredMethods.filter[isNotification] »
                notificationsHandler["«m.jsonRpcMethodName»"] = («m.parameters.map[simpleName].join(', ')») => target.«m.simpleName»(«m.parameters.map[simpleName].join(', ')»);
                «ENDFOR»
                const registration = connection.addNotificationHandler(notificationsHandler);
                return registration;
            }

            export interface IConnection {
                addNotificationHandler(handler: NotificationsHandler) : Disposable
            }

            export interface NotificationsHandler {
                [method: string]: «imports.apply('GenericNotificationHandler')»
            }
            «ENDIF»
        }
    '''
    
    protected def CharSequence toServiceInterface(InterfaceDeclaration intf, (String)=>String imports, extension JsonRPCGeneratorContext context) '''
        «intf.tsComment»
        export interface «intf.serviceInterface» extends «imports.apply('Disposable')» {
        «FOR m : intf.declaredMethods»
            
                «m.tsComment»
                «IF m.isNotification»
                    «m.simpleName»(«m.parameters.map[simpleName+": "+type.tsType(context)].join(", ")»): void;
                «ELSE» 
                    «m.simpleName»(«m.parameters.map[simpleName+": "+type.tsType(context)+", "].join()»token?: «imports.apply('CancellationToken')»): Thenable<«m.getResultType(context)»>;
                «ENDIF»
        «ENDFOR»
        }
    '''
    
    protected def CharSequence toServiceClass(InterfaceDeclaration intf, (String)=>String imports, extension JsonRPCGeneratorContext context) '''
        export class «intf.serviceClass» implements «intf.serviceInterface» {
        
            protected connection: «imports.apply('MessageConnection')»;
        
            constructor(connection: «imports.apply('MessageConnection')») {
                this.connection = connection;
            }
        
            dispose() {
            }
        «FOR m : intf.declaredMethods»
            
                «IF m.isNotification»
                    «m.simpleName»(«m.parameters.map[simpleName+": "+type.tsType(context)].join(", ")»): void {
                        return this.connection.sendNotification(«m.simpleName.toFirstUpper»Notification.type«m.parameters.map[", "+simpleName].join()»);
                    }
                «ELSE»
                    «m.simpleName»(«m.parameters.map[simpleName+": "+type.tsType(context)+", "].join()»token?: «imports.apply('CancellationToken')»): Thenable<«m.getResultType(context)»> {
                        token = token || CancellationToken.None;
                        return this.connection.sendRequest(«m.simpleName.toFirstUpper»Request.type«m.parameters.map[", "+simpleName].join()», token);
                    }
                «ENDIF»
        «ENDFOR»

        }
    '''
    
}

@FinalFieldsConstructor
class JsonRPCGeneratorContext implements CodeGenerationContext {
    
    @Delegate
    val CodeGenerationContext delegate
    
    val Set<TypeDeclaration> handled = newHashSet
    
    val Map<Element, String> tsTypes = newHashMap
    
    def boolean markAsHandled(TypeDeclaration declaration) {
        return this.handled.add(declaration)
    }
    
    def void setTsType(Element typeReference, String tsType) {
        this.tsTypes.put(typeReference, tsType)
    }

    def String getTsType(Element typeReference) {
        return this.tsTypes.get(typeReference)
    }

}