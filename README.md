# @azerothian/nspaced

Drop in replacement for [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked) * seems to be dead and has not been updated in a very long time, 

## TODO

Look at bind/context setting, atm bind only binds it to the current context,



This is using [AsyncLocalStorage](https://github.com/nodejs/node/blob/main/doc/api/async_context.md#class-asynclocalstorage) instead of [async_hooks](https://github.com/nodejs/node/blob/main/doc/api/async_hooks.md)

It uses a Map to store the values and will clone the parent map when run is called.


```typescript
import { createNamespace, getNamespace } from "../src";

const writer = createNamespace('writer');
writer.run(function () {
  writer.set('value', 0);
  requestHandler();
});

let bindTest: any;

function requestHandler() {
  writer.run(function(outer) {
    // writer.get('value') returns 0
    // outer.value is 0
    console.log("outer.value", outer.get("value")); // prints 0
    writer.set('value', 1);
    // writer.get('value') returns 1
    console.log("outer.value", outer.get("value")); // prints 1
    // outer.value is 1
    process.nextTick(function() {
      // writer.get('value') returns 1
      // outer.value is 1
      writer.run(function(inner) {
        // writer.get('value') returns 1
        // outer.value is 1
        console.log("outer.value", outer.get("value")); // prints 1
        // inner.value is 1
        console.log("outer.value", inner.get("value")); // prints 1
        writer.set('value', 2);
        // writer.get('value') returns 2
        // outer.value is 1
        console.log("outer.value", outer.get("value")); // prints 1
        // inner.value is 2
        console.log("outer.value", inner.get("value")); // prints 2
        bindTest = writer.bind(function() {
          const ns = getNamespace('writer');
          console.log("outer.value", ns.get("value")); // prints 2
        });
      });
    });
  });

  setTimeout(function() {
    // runs with the default context, because nested contexts have ended
    console.log(writer.get('value')); // prints 0
    bindTest(); // prints 2
  }, 1000);
}


```

## Class: Namespaced

