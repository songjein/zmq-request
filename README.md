zeromq REQ with throwaway socket and Promise response

This package wraps a REQ request of the [zeromq](https://www.npmjs.com/package/zeromq) package, using one socket per request and a Promise reply.

In the [zeromq](https://www.npmjs.com/package/zeromq) package, one is tempted to open a REQ socket and make many requests from it, but this is not how REQ/REP works on 0MQ.

One should read the reply before sending another request, but this is not pratical in an event-loop context like NodeJS.

This package opens a new socket, sends the request, waits the reply, closes the socket and resolves the Promise.

```javascript
const
  log = console.log,
  Request = require('zmq-request'),
  zmq = require('zeromq');

// minimal echo server
rep = zmq.socket('rep').bindSync('tcp://*:3000');
rep.on('message', raw => rep.send(raw));

const request = new Request({ port: 3000 });
request
  .send({ ok: true })
  .then(log)   // { ok: true }
  .catch(log)
  .then(() => rep.close())
```

Multiple parallel requests
```javascript
const
  log = console.log,
  Request = require('zmq-request'),
  zmq = require('zeromq');

// minimal echo server
rep = zmq.socket('rep').bindSync('tcp://*:3000');
rep.on('message', raw => rep.send(raw));

const request = new Request({ port: 3000 });
Promise.all([
  request.send({ ok: 1 }),
  request.send({ ok: 2 }),
  request.send({ ok: 3 }),
  request.send({ ok: 4 }),
  request.send({ ok: 5 })
])
  .then(log)  // [ { ok: 1 }, { ok: 2 }, { ok: 3 }, { ok: 4 }, { ok: 5 } ]
  .catch(log)
  .then(() => rep.close());
```