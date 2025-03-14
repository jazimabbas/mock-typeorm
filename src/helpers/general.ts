export function createClass(name: string) {
  const DynamicClass = class {
    constructor() {}
  };

  const handler = {
    construct(target: any, args: any[]) {
      const instance = Reflect.construct(target, args);
      Object.defineProperty(instance.constructor, "name", {
        value: name,
        writable: false,
      });
      return instance;
    },
  };

  return new Proxy(DynamicClass, handler as any);
}

type Obj = { [x: string]: any };

export function retrieveAvailableMethods(object: Obj, methods: string[]) {
  return methods.filter((method) => !!object[method]);
}
