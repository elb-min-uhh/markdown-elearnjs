/**
 * An object which can inherit values from a given object based on a set
 * of defined keys. Other values will be omitted.
 */

export abstract class AInheritingObject {
    // general index signature
    [key: string]: any;

    protected static readonly CLASS_KEYS: string[] = [];

    constructor(values?: { [key: string]: any }) {
        AInheritingObject.inheritValues(this, AInheritingObject.CLASS_KEYS, values);
    }

    /**
     * Copy only the defined `keys` from the `values` object into this.
     * @param keys list of allowed keys
     * @param values object
     */
    protected static inheritValues(target: any, keys: string[], values?: { [key: string]: any }) {
        if(values) {
            Object.keys(values).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    target[key] = values[key];
                }
            });
        }
    }
}
