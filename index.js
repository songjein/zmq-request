const
  assert = require('assert'),
  zmq = require('zeromq');

module.exports = class Request {
  constructor({ transport = 'tcp', host = 'localhost', port }) {
    assert(port, 'port is required');

    Object.assign(this, { transport, host, port });
  }

  send(data) {
    return new Promise((resolve, reject) => {
      try {
        const req = zmq.socket('req').connect(this._connection_string());
        req.send(JSON.stringify(data));
        req.on('message', raw => {
          req.close();
          resolve(JSON.parse(raw.toString()));
        });
      } catch (err) {
        reject(err);
      }
    })
  }

  _connection_string() {
    return `${this.transport}://${this.host}:${this.port}`;
  }
}