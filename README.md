__zeromq REQ with renewed socket and Promise response__

This package wraps a REQ socket from the [zeromq](https://www.npmjs.com/package/zeromq) package.

Reusing the same REQ socket for repeating requests in an async environment (Node.js) is not easy, as 0MQ requires to read the reply before sending a new one.

This package opens a new socket, sends the request, waits for the reply, closes the socket and resolves the Promise.

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
  request.send({ data: 1 }),
  request.send({ data: 2 }),
  request.send({ data: 3 }),
  request.send({ data: 4 }),
  request.send({ data: 5 })
])
  .then(log)  // [ { data: 1 }, { data: 2 }, { data: 3 }, { data: 4 }, { data: 5 } ]
  .catch(log)
  .then(() => rep.close());
  
```