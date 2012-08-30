
// pg#215, Example 9-6. Set.js: An arbitrary set of values

function Set() {	// This is the constructor
    this.values = {};	// The properties of this object hold the set
    this.n = 0;		// How many values are in the set
    this.add.apply(this, arguments);	// All arguments are values to add
}

// Add each of the arguments to the set.
Set.prototype.add = function() {
    for(var i = 0; i < arguments.length; i++) {	// For each argument
	var val = arguments[i];			// The value to add to the set
	var str = Set._v2s(val);		// Transform it to a string
	if (!this.values.hasOwnProperty(str)) {	// If no already in the set
	    this.values[str] = val;		// Map string to value
	    this.n++;				// Increase set size
	}
    }
    return this;				// Support chained method calls
};

// Remove each of the arguments from the set.
Set.prototype.remove = function() {
    for(var i = 0; i < arguments.length; i++) {	// For each argument
	var str = Set._v2s(arguments[i]);	// Map to a string
	if (this.values.hasOwnProperty(str)) {	// If it is in the set
	    delete this.values[str];		// Delete it
	    this.n--;				// Decrease set size
	}
    }
    return this;				// For method chaining
};

// Return true if the set contains value; false otherwise.
Set.prototype.contains = function(value) {
	return this.values.hasOwnProperty(Set._v2s(value));
};

// Return the size of the set.
Set.prototype.size = function() { return this.n; };

// Call function f on the specified context for each element of the set.
Set.prototype.foreach = function(f, context) {
    for(var s in this.values)			// For each string in the set
	if (this.values.hasOwnProperty(s))	// Ignore inherited properties
	    f.call(context, this.values[s]);	// Call f on the value
};

// This internal function maps any Javascript value to a unique string.
Set._v2s = function(val) {
    switch(val) {
	case undefined:	return 'u';	// Special primitive
	case null:	return 'n';	// values get single-letter
	case true:	return 't';	// codes.
	case false:	return 'f';
    }
    /* default */ switch (typeof val) {
	case 'number':	return '#' + val;	// Number get # prefix.
	case 'string':	return '"' + val;	// String get " prefix
    }
    /* default */
    return '@' + objectId(val);			// Objs and funcs get @

    // For any object, return a string. This function will return a different
    // string for different objects, and will always return the same string
    // if called multiple times for the same object. to do this it creates a
    // property on o. In ES5 the property would be nonenumerable and read-only

    function objectId(o) {
	var prop = "|**objectid**|";	// Private property name for storing ids
	if (!o.hasOwnProperty(prop))	// If the object has on id
	    o[prop] = Set._v2s.next++;	// Assign it the next available
	return o[prop];			// Return the id
    }
};

Set._v2s.next = 100;	// Start assigning object ids at this value.

// pg#221, add these methods to the Set prototype object.
extend(Set.prototype, {
	// Convert a set to a string
	toString: function() {
		var s = "{", i = 0;
		this.foreach(function(v) { s+=((i++ > 0)?", ":"") + v;});
		return s + "}";
	},
	// Like toString, but call toLocalString on all values
	toLocaleString: function() {
		var s = "{", i = 0;
		this.foreach(function(v) {
				if (i++ > 0) s += ", ";
				if (v == null) s += v;	// null & undefined
				else s += v.toLocaleString();	// all others
			});
		return s + "}";
	},
	// Convert a set to an array of values
	toArray: function() {
		var a = [];
		this.foreach(function(v) { a.push(v); });
		return a;
	}
});

// Treat sets like arrays for the purpose of JSON stringification.
Set.prototype.toJSON = Set.prototype.toArray;
Set.prototype.equals = function(that) {
    // Shortcut for trivial case
    if (this === that)	return true;

    // If the that object is not a set, it is not equal to this one.
    // We use instanceof to allow any subclass of Set.
    // We could relax this test if wanted true duck-typing.
    // Or we could strengthen it to check this.constructor == that.constructor
    // Note that instanceof properly rejects null and undefined values
    if (!(that instanceof Set))	return false;

    // If two sets don't have the same size, they're no equal
    if (this.size() != that.size())	return false;

    // Now check whether every element in this is also in that.
    // Use an exception to break out of the foreach if the sets are not equal.
    try {
	this.foreach(function(v) { if (!that.contains(v)) throw false; });
	return true;	// All elements matched: sets are equal.
    } catch(x) {
	if (x === false) return false;	// An element in this is not in that.
	throw x;			// Some other exception: rethrow it.
    };
};

// wkliang:20120820
var ms = new Set(true, null, undefined, false);
