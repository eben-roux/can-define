"use strict";
var QUnit = require("steal-qunit");
var define = require("can-define");
var DefineMap = require("can-define/map/map");
var Observation = require("can-observation");
var canTypes = require("can-util/js/types/types");
var each = require("can-util/js/each/each");

QUnit.module("can-define/map/map");

QUnit.test("creating an instance", function(){
    var map = new DefineMap({prop: "foo"});
    map.on("prop", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "BAR");
        QUnit.equal(oldVal, "foo");
    });

    map.prop ="BAR";
});

QUnit.test("creating an instance with nested prop", function(){

    var map = new DefineMap({name: {first: "Justin"}});

    map.name.on("first", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "David");
        QUnit.equal(oldVal, "Justin");
    });

    map.name.first ="David";
});


QUnit.test("extending", function(){
    var MyMap = DefineMap.extend({
        prop: {}
    });

    var map = new MyMap();
    map.on("prop", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "BAR");
        QUnit.equal(oldVal, undefined);
    });

    map.prop = "BAR";
});

QUnit.test("extending DefineMap constructor functions", function(){
    var MyMap = DefineMap.extend("MyMap", { prop: {}, mymap: function(){} });

    var MyMapExtended = MyMap.extend("MyMapX", { foo: {}, mymapx: function(){} });

    var MyMapExtendedAgain = MyMapExtended.extend("MyMapXX", { bar: {}, mymapxx: function(){} });

    var map = new MyMapExtendedAgain();

    map.on("prop", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "PROP");
        QUnit.equal(oldVal, undefined);
    });
    map.on("foo", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "FOO");
        QUnit.equal(oldVal, undefined);
    });
    map.on("bar", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "BAR");
        QUnit.equal(oldVal, undefined);
    });

    map.prop = "PROP";
    map.foo = 'FOO';
    map.bar = 'BAR';
    QUnit.ok(map.mymap);
    QUnit.ok(map.mymapx);
    QUnit.ok(map.mymapxx);
});

QUnit.test("extending DefineMap constructor functions more than once", function(){
    var MyMap = DefineMap.extend("MyMap", { prop: {}, mymap: function(){} });

    var FirstMapExtended = MyMap.extend("FirstMapExtended", { foo: {}, firstMapExtended: function(){} });

    var SecondMapExtended = MyMap.extend("SecondMapExtended", { bar: {}, secondMapExtended: function(){} });

    var map1 = new FirstMapExtended();
    var map2 = new SecondMapExtended();

    map1.on("prop", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "PROP");
        QUnit.equal(oldVal, undefined);
    });
    map1.on("foo", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "FOO");
        QUnit.equal(oldVal, undefined);
    });

    map2.on("prop", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "PROP");
        QUnit.equal(oldVal, undefined);
    });
    map2.on("bar", function(ev, newVal, oldVal){
        QUnit.equal(newVal, "BAR");
        QUnit.equal(oldVal, undefined);
    });

    map1.prop = "PROP";
    map1.foo = 'FOO';
    map2.prop = "PROP";
    map2.bar = 'BAR';
    QUnit.ok(map1.mymap);
    QUnit.ok(map1.firstMapExtended);
    QUnit.ok(map2.mymap);
    QUnit.ok(map2.secondMapExtended);
});

QUnit.test("setting not defined property", function(){
    var MyMap = DefineMap.extend({
        prop: {}
    });
    var mymap = new MyMap();

    try {
        mymap.notdefined = "value";
        ok(false, "no error");
    } catch(e) {
        ok(true, "error thrown");
    }
});

QUnit.test("loop only through defined serializable props", function(){
    var MyMap = DefineMap.extend({
        propA: {},
        propB: {serialize: false},
        propC: {
            get: function(){
                return this.propA;
            }
        }
    });
    var inst = new MyMap({propA: 1, propB: 2});
    QUnit.deepEqual(Object.keys(inst.get()), ["propA"]);

});

QUnit.test("get and set can setup expandos", function(){
    var map = new DefineMap();
    var oi = new Observation(function(){
        return map.get("foo");
    },null,{
        updater: function(newVal){
            QUnit.equal(newVal, "bar", "updated to bar");
        }
    });
    oi.start();

    map.set("foo","bar");

});

QUnit.test("default settings", function(){
    var MyMap = DefineMap.extend({
        "*": "string",
        foo: {}
    });

    var m = new MyMap();
    m.set("foo",123);
    QUnit.ok(m.get("foo") === "123");

});

QUnit.test("default settings on unsealed", function(){
    var MyMap = DefineMap.extend({
        seal: false
    },{
        "*": "string"
    });

    var m = new MyMap();
    m.set("foo",123);
    QUnit.ok(m.get("foo") === "123");

});

QUnit.test("get with dynamically added properties", function(){
    var map = new DefineMap();
    map.set("a",1);
    map.set("b",2);
    QUnit.deepEqual(map.get(), {a: 1, b:2});
});


QUnit.test("set multiple props", function(){
    var map = new DefineMap();
    map.set({a: 0, b: 2});

    QUnit.deepEqual(map.get(), {a: 0, b:2});

    map.set({a: 2}, true);

    QUnit.deepEqual(map.get(), {a: 2});

    map.set({foo: {bar: "VALUE"}});

    QUnit.deepEqual(map.get(), {foo: {bar: "VALUE"}, a: 2});
});

QUnit.test("serialize responds to added props", function(){
    var map = new DefineMap();
    var oi = new Observation(function(){
        return map.serialize();
    },null,{
        updater: function(newVal){
            QUnit.deepEqual(newVal, {a: 1, b: 2}, "updated right");
        }
    });
    oi.start();

    map.set({a: 1, b: 2});
});

QUnit.test("initialize an undefined property", function(){
    var MyMap = DefineMap.extend({seal: false},{});
    var instance = new MyMap({foo:"bar"});

    equal(instance.foo, "bar");
});

QUnit.test("set an already initialized null property", function(){
  var map = new DefineMap({ foo: null });
  map.set({ foo: null });

  equal(map.foo, null);
});

QUnit.test("creating a new key doesn't cause two changes", 1, function(){
    var map = new DefineMap();
    var oi = new Observation(function(){
        return map.serialize();
    },null,{
        updater: function(newVal){
            QUnit.deepEqual(newVal, {a: 1}, "updated right");
        }
    });
    oi.start();

    map.set("a", 1);
});

QUnit.test("setting nested object", function(){
    var m = new DefineMap({});

    m.set({foo: {}});
    m.set({foo: {}});
    QUnit.deepEqual(m.get(), {foo: {}});
});

QUnit.test("passing a DefineMap to DefineMap (#33)", function(){
    var MyMap = DefineMap.extend({foo: "observable"});
    var m = new MyMap({foo: {}, bar: {}});

    var m2 = new MyMap(m);
    QUnit.deepEqual(m.get(), m2.get());
    QUnit.ok(m.foo === m2.foo, "defined props the same");
    QUnit.ok(m.bar === m2.bar, "expando props the same");

});

QUnit.test("serialize: function works (#38)", function(){
    var Something = DefineMap.extend({});

    var MyMap = DefineMap.extend({
        somethingRef: {
            type: function(val){
                return new Something({id: val});
            },
            serialize: function(val){
                return val.id;
            }
        },
        somethingElseRef: {
            type: function(val){
                return new Something({id: val});
            },
            serialize: false
        }
    });

    var myMap = new MyMap({somethingRef: 2, somethingElseRef: 3});

    QUnit.ok(myMap.somethingRef instanceof Something);
    QUnit.deepEqual( myMap.serialize(), {somethingRef: 2}, "serialize: function and serialize: false works");


    var MyMap2 = DefineMap.extend({
        "*": {
            serialize: function(value){
                return ""+value;
            }
        }
    });

    var myMap2 = new MyMap2({foo: 1, bar: 2});
    QUnit.deepEqual( myMap2.serialize(), {foo: "1", bar: "2"}, "serialize: function on default works");

});

QUnit.test("isMapLike", function(){
    var map = new DefineMap({});
    ok(canTypes.isMapLike(map), "is map like");
});

QUnit.test("get will not create properties", function(){
    var method = function(){};
    var MyMap = DefineMap.extend({
        method: method
    });
    var m = new MyMap();
    m.get("foo");

    QUnit.equal(m.get("method"), method);
});

QUnit.test("Properties are enumerable", function(){
  QUnit.expect(4);

  var VM = DefineMap.extend({
    foo: "string"
  });
  var vm = new VM({ foo: "bar", baz: "qux" });

  var i = 0;
  each(vm, function(value, key){
    if(i === 0) {
      QUnit.equal(key, "foo");
      QUnit.equal(value, "bar");
    } else {
      QUnit.equal(key, "baz");
      QUnit.equal(value, "qux");
    }
    i++;
  });
});

QUnit.test("Getters are not enumerable", function(){
  QUnit.expect(2);

  var MyMap = DefineMap.extend({
    foo: "string",
    baz: {
      get: function(){
        return this.foo;
      }
    }
  });

  var map = new MyMap({ foo: "bar" });

  each(map, function(value, key){
    QUnit.equal(key, "foo");
    QUnit.equal(value, "bar");
  });
});
