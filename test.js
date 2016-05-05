require("list/list-test");
require("map/map-test");
require("define-test");
var DefineMap = require("./map/map");
var DefineList = require("./list/list");

var QUnit = require("steal-qunit");

QUnit.module("map and list combined");

QUnit.test("basics", function(){
    var items = new DefineMap({ people: [{name: "Justin"},{name: "Brian"}], count: 1000 });
    QUnit.ok(items.people instanceof DefineList, "people is list");
    QUnit.ok(items.people.item(0) instanceof DefineMap, "1st object is Map");
    QUnit.ok(items.people.item(1) instanceof DefineMap, "2nd object is Map");
    QUnit.equal(items.people.item(1).name, "Brian", "2nd object's name is right");
    QUnit.equal(items.count, 1000, "count is number");
})
