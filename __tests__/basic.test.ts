import {describe, it, expect} from "@jest/globals";
import { createNamespace, getNamespace } from "../src";

describe('Basic namespace tests', () => {
  it('basic test of run', () => {
    const ns = createNamespace('test');
    function test() {
      expect(ns.get('key')).toBe('value');
    }
    ns.run(() => {

      expect(ns.get('key')).toBeUndefined();
      ns.set('key', 'value');
      test();
    });
  });
  it('complex test of run', async() => {
    const writer = createNamespace('writer');
    let bindTest: any;
    function requestHandler() {
      return new Promise<void>((resolve) => {
        writer.run(function(outer) {expect(outer.get("value")).toBe(0);
          writer.set('value', 1);
          expect(outer.get("value")).toBe(1);
          process.nextTick(function() {
            writer.run(function(inner) {
              expect(outer.get("value")).toBe(1);
              expect(inner.get("value")).toBe(1);
              writer.set('value', 2);
              expect(outer.get("value")).toBe(1);
              expect(inner.get("value")).toBe(2);
              bindTest = writer.bind(function() {
                const ns = getNamespace('writer');
                expect(ns.get("value")).toBe(2);
              });
              return resolve();
            });
          });
        });
      });
    }
    await writer.run(async function () {
      writer.set('value', 0);
      await requestHandler();
    });
    await bindTest();
  });
});