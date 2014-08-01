The most readable, logical, maintainable Node app ever, thanks to Koa and generators. It is still fully non-blocking, and very performant. According to benchmarks that Jongleberry put up, Koa is more performant than Express if you yield inner generators rather than the full generator, which I have done completely throughout the server.

These generators are an absolute game changer for Node. Beautiful, synchronous-looking code can now replace callback hell, therefore making JS/Node less "write-only".

`Co`, the library by TJH, runs the generators in this repo, yield thunks, not promises, at the lowest level. Thunks have a signature similar to a callback, but the would be callback is wrapped as an argument and handed directly to `Thunkable`, another awesome library by TJH. The simplicity of thunks handily outperforms Promises (can't remember where I saw the statistics) and when yielded, look far more straightforward than Promises as well.

The repo was written most in pure JS and some in Coffeescript. Coffeescript was used mainly due to its "class" based metaprogramming abilities (`super`, `extend`, etc). I also used it to generate a couple loops using its `for...in ` syntax and create closures. The part about CS that I actually like the most was the destructuring patterns. It generates some pretty ugly (yet concise) JS, but it saved me a lot of code and was freaking fun as hell to use. I wrote all the generators and functions in JS because CoffeeScript does not support the `yield` and `*` from Harmony.

NodeGenBlog uses the awesome Postgres and Redis db's. Relations in Postgres are denormalized by using arrays. This substantially increases read performance. Redis acts the same way, storing solely foreign id arrays that it feeds directly into Postgres. When used in this manner, these two databases become extremely powerful and blazingly fast.

NodeGenBlog is configured to use `HAProxy` and `Socket.io` because awesome.