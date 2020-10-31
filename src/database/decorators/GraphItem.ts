import 'reflect-metadata';
import { ClassRegistry } from '../registry';

export const Key = 'GraphClassMeta';

export interface GraphClassMeta {
    name: string;
    parent?: GraphClassMeta;
}

export function GraphItem(className: string): ClassDecorator {

    return function(target: any): any {
        (<any>target).graphItemName = className;
        const parent = Reflect.getMetadata(Key, target.prototype.constructor);
        Reflect.defineMetadata(Key, {
            name: className,
            parent
        }, target);
        ClassRegistry.current.register(className, target);

        return target;
    };
}
