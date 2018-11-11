"use strict";

import { AInheritingObject } from "../AInheritingObject";
import { ExtensionObject } from "./ExtensionObject";

/**
 * An object containing information about the included extensions as well
 * as the selected language.
 *
 * Extending the `ExtensionObject`
 */
export class InclusionObject extends ExtensionObject {

    protected static readonly CLASS_KEYS = [
        "language",
    ];

    /**
     * Language key.
     * Default: "en"
     */
    public language?: "en" | "de" = "en";

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} options: Manual values for this objects fields. All optional.
     */
    constructor(options?: InclusionObject) {
        super(options);
        AInheritingObject.inheritValues(this, InclusionObject.CLASS_KEYS, options);
    }
}
