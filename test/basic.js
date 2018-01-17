const
  assert = require('assert'),
  delay = require('delay'),
  Request = require('../'),
  should = require('should'),
  zmq = require('zeromq');

describe('Basic connection', () => {
  let rep;

  beforeEach(() => {
    // echo server
    rep = zmq.socket('rep').bindSync('tcp://*:3000');
    rep.on('message', raw => rep.send(raw));
  });

  afterEach(() => {
    rep.close();
    return delay(50);  // give little time to close the socket (close is async but lacks a callback)
  });

  it('should send one request and get a reply', done => {
    const request = new Request({ port: 3000 });
    request
      .send({ ok: true })
      .then(data => {
        assert.equal(data.ok, true, `response invalid: ${JSON.stringify(data)}`);
        done();
      })
      .catch(done)
  });

  it('should send sequential requests', done => {
    const request = new Request({ port: 3000 });
    request
      .send({ ok: 1 })
      .then(data => {
        assert.equal(data.ok, 1, `response invalid: ${JSON.stringify(data)}`);
      })
      .then(() => request.send({ ok: 2 }))
      .then(data => {
        assert.equal(data.ok, 2, `response invalid: ${JSON.stringify(data)}`);
      })
      .then(() => request.send({ ok: 3 }))
      .then(data => {
        assert.equal(data.ok, 3, `response invalid: ${JSON.stringify(data)}`);
      })
      .then(() => done())
      .catch(done);
  });

  it('should send parallel requests', done => {
    const request = new Request({ port: 3000 });
    Promise.all([
      request.send({ ok: 1 }).then(data => assert.equal(data.ok, 1, `response invalid: ${JSON.stringify(data)}`)),
      request.send({ ok: 2 }).then(data => assert.equal(data.ok, 2, `response invalid: ${JSON.stringify(data)}`)),
      request.send({ ok: 3 }).then(data => assert.equal(data.ok, 3, `response invalid: ${JSON.stringify(data)}`)),
      request.send({ ok: 4 }).then(data => assert.equal(data.ok, 4, `response invalid: ${JSON.stringify(data)}`)),
      request.send({ ok: 5 }).then(data => assert.equal(data.ok, 5, `response invalid: ${JSON.stringify(data)}`)),
    ])
      .then(() => done())
      .catch(done);
  });

  it('should send a lot of parallel requests', done => {
    const request = new Request({ port: 3000 });
    const rs = [];
    for (let i = 0; i < 500; i++)
      rs.push(
        (ii => request
          .send({ ok: ii })
          .then(data => assert.equal(data.ok, ii, `response invalid: ${JSON.stringify(data)}`)))(i)
      );
    Promise.all(rs)
      .then(() => done())
      .catch(done);
  }).timeout(5000);
})