// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var a = undefined;
{
  class C {
    field = a.instantiate();
  }

  assertThrows(() => {
    let c = new C;
  }, TypeError);
}
