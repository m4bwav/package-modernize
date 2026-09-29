'use strict';
// capture-proxy (package-modernize): the proxy setup of a golden capture that records a package's requests through
// its own stand-in proxy with TLS, in one function that the recording against the old version and every replay
// against a new major call unchanged (L-125 `replayable-proxy-setup`; references/npm.md, "One proxy setup for the
// recording and the replay"). Copy it beside the capture script in the scratch project and commit it with the capture.
//
//   const {startCaptureProxy} = require('./capture-proxy.cjs');
//   async function main() {
//     const proxy = await startCaptureProxy({plain, secure});  // FIRST: before require('{{PACKAGE}}'), before any spawn
//     const library = require('{{PACKAGE}}');
//     ... cases; a CLI case: spawn(process.execPath, [binPath()], {env: proxy.env}) ...
//     process.stderr.write(proxy.report());                    // routes and guard check: for the log, not the JSON
//     await proxy.close();
//   }
//
// `plain` and `secure` are the capture's fixture servers: http.createServer(handler) and https.createServer({key,
// cert}, handler) with the capture's throwaway certificate. They need not listen. The handler sees an absolute URL
// (`http://host/path`) when a client sent the request to the proxy itself and a path when it came through CONNECT,
// so route by `new URL(request.url, 'http://' + request.headers.host)`.
//
// What it does, in this order:
// 1. Installs the socket guard in this process and tests it: any connection to a host other than 127.0.0.1,
//    localhost or ::1 throws. It reads the options from `Array.isArray(args[0]) ? args[0][0] : args[0]`, because
//    net.connect() passes its arguments as one array and a guard reading args[0].host lets plain http out (L-124).
// 2. Starts the proxy on 127.0.0.1. It answers CONNECT and routes by the CONNECT port: 443 to `secure`, any other
//    port to `plain` (Node's fetch tunnels http: links with CONNECT host:80 too). Requests sent to the proxy
//    directly (request 2.88's http links) go to `plain`. Every CONNECT line is kept in `connects`.
// 3. Sets HTTP_PROXY, HTTPS_PROXY (and lowercase), NO_PROXY, NODE_USE_ENV_PROXY=1, NODE_EXTRA_CA_CERTS (when `ca`
//    is given) and the guard preload in NODE_OPTIONS in process.env, so the package, when it loads, and every child
//    process started from now on see them. Node reads NODE_USE_ENV_PROXY and NODE_EXTRA_CA_CERTS at startup.
//    NO_PROXY replaces any inherited list with the loopback names only: with it empty, Node 24's own proxy support
//    also proxied request 2.88's connection to the proxy, and the recorded http request line gained the proxy's
//    random port (http://host:PORT/path; Node 24.18.0, 2026-09-29).
// 4. Routes this process's fetch, which read its proxy settings at startup: undici's EnvHttpProxyAgent through
//    setGlobalDispatcher when undici is installed in the scratch project (Node 20 needs it), otherwise Node's
//    http.setGlobalProxyFromEnv when this Node has it. Then picks the children's route by a probe:
//    NODE_USE_ENV_PROXY=1 (Node 24), else undici's EnvHttpProxyAgent preloaded (Node 20: npm install undici@7).
//    Probes ask only for capture-proxy-probe.invalid, which the proxy answers itself.
//
// Returns {proxyUrl, env, route, connects, guardMessage, guardFile, report(), close()}. `env` is the environment
// for child processes; grep the golden file for `guardMessage` (0 expected). TLS trust stays with the capture:
// NODE_TLS_REJECT_UNAUTHORIZED=0 set at run time covers this process, `ca` covers the children.
//
// Self-test, nothing leaves the machine (only .invalid hosts): node capture-proxy.cjs --selftest

const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const tls = require('node:tls');
const {spawn} = require('node:child_process');

const GUARD_MESSAGE = 'capture guard: refused a connection to';
const PROBE_HOST = 'capture-proxy-probe.invalid';
const GUARD_TEST_HOST = 'guard-test.invalid';
const LOOPBACK = '127.0.0.1,localhost,::1';

const GUARD = `'use strict';
const net = require('node:net');
const mark = Symbol.for('package-modernize.capture-guard');
if (!net.Socket.prototype[mark]) {
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    // net.connect() and net.createConnection() pass their arguments normalised into one array (L-124).
    const first = Array.isArray(args[0]) ? args[0][0] : args[0];
    const options = typeof first === 'object' && first !== null ? first : {port: first, host: args[1]};
    if (!options.path && !['127.0.0.1', 'localhost', '::1', undefined].includes(options.host)) {
      throw new Error(${JSON.stringify(GUARD_MESSAGE)} + ' ' + options.host + ':' + options.port);
    }

    return Reflect.apply(connect, this, args);
  };
  net.Socket.prototype[mark] = true;
}
`;

const PROBE = `fetch('http://${PROBE_HOST}/').then(r => console.log(r.status), e => console.log(String(e.cause?.message ?? e.message)));`;
const CHILD_GUARD_TEST = `try { require('node:net').connect(80, '${GUARD_TEST_HOST}').destroy(); console.log('connected'); } catch (error) { console.log(error.message); }`;

// NODE_OPTIONS reads a backslash as an escape: preload paths go in with forward slashes.
const preload = file => `--require "${path.resolve(file).split(path.sep).join('/')}"`;

function runChild(code, env) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['-e', code], {env, stdio: ['ignore', 'pipe', 'pipe']});
    let out = '';
    child.stdout.on('data', chunk => {
      out += chunk;
    });
    child.stderr.on('data', chunk => {
      out += chunk;
    });
    child.on('close', () => resolve(out.replaceAll('\r\n', '\n').trim()));
  });
}

function undiciPath() {
  try {
    return require.resolve('undici', {paths: [process.cwd(), __dirname]});
  } catch {
    return undefined;
  }
}

async function probeThisProcess() {
  try {
    return String((await fetch(`http://${PROBE_HOST}/`)).status);
  } catch (error) {
    return String(error.cause?.message ?? error.message);
  }
}

function guardCheckThisProcess() {
  // Both argument shapes: net.connect passes an array, tls.connect an options object.
  const attempts = {'net.connect': () => net.connect(80, GUARD_TEST_HOST), 'tls.connect': () => tls.connect(443, GUARD_TEST_HOST)};
  for (const [name, open] of Object.entries(attempts)) {
    let socket;
    try {
      socket = open();
    } catch (error) {
      if (String(error.message).startsWith(GUARD_MESSAGE)) {
        continue;
      }

      throw error;
    }

    socket.on('error', () => {});
    socket.destroy();
    throw new Error(`capture-proxy: the guard let ${name} to ${GUARD_TEST_HOST} through`);
  }
}

async function startCaptureProxy({plain, secure, ca, onConnect} = {}) {
  if (!plain) {
    throw new TypeError('capture-proxy: pass the plain fixture server as {plain}');
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-proxy-'));
  const guardFile = path.join(dir, 'guard.cjs');
  fs.writeFileSync(guardFile, GUARD);

  // 1. The guard, in this process, tested before anything can connect.
  require(guardFile);
  guardCheckThisProcess();

  // 2. The stand-in proxy.
  const connects = [];
  const proxy = http.createServer((request, response) => {
    if (request.url.startsWith(`http://${PROBE_HOST}`)) {
      response.writeHead(204).end();
      return;
    }

    plain.emit('request', request, response);
  });
  proxy.on('connect', (request, socket, head) => {
    socket.on('error', () => {});
    const colon = request.url.lastIndexOf(':');
    const host = request.url.slice(0, colon).replace(/^\[|]$/g, '');
    const port = request.url.slice(colon + 1);
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (host === PROBE_HOST) {
      socket.once('data', () => socket.end('HTTP/1.1 204 No Content\r\nConnection: close\r\n\r\n'));
      return;
    }

    connects.push(`CONNECT ${request.url}`);
    onConnect?.(request);
    const target = port === '443' ? secure : plain;
    if (!target) {
      socket.destroy();
      return;
    }

    if (head?.length) {
      socket.unshift(head);
    }

    target.emit('connection', socket);
  });
  await new Promise(resolve => {
    proxy.listen(0, '127.0.0.1', resolve);
  });
  const proxyUrl = `http://127.0.0.1:${proxy.address().port}`;

  // 3. The variables, before the package loads and before any child starts.
  Object.assign(process.env, {
    HTTP_PROXY: proxyUrl,
    HTTPS_PROXY: proxyUrl,
    NO_PROXY: LOOPBACK,
    http_proxy: proxyUrl,
    https_proxy: proxyUrl,
    no_proxy: LOOPBACK,
    NODE_USE_ENV_PROXY: '1',
  });
  if (ca) {
    process.env.NODE_EXTRA_CA_CERTS = path.resolve(ca);
  }

  const baseOptions = [process.env.NODE_OPTIONS, preload(guardFile)].filter(Boolean).join(' ');
  process.env.NODE_OPTIONS = baseOptions;

  const childGuard = await runChild(CHILD_GUARD_TEST, {...process.env});
  if (!childGuard.startsWith(GUARD_MESSAGE)) {
    throw new Error(`capture-proxy: the guard preload did not refuse ${GUARD_TEST_HOST} in a child: ${childGuard}`);
  }

  // 4. This process's fetch, then the children's route.
  const route = {thisProcess: 'not routed', children: 'not routed'};
  const undici = undiciPath();
  if (undici) {
    const {setGlobalDispatcher, EnvHttpProxyAgent} = require(undici);
    setGlobalDispatcher(new EnvHttpProxyAgent());
    route.thisProcess = 'undici EnvHttpProxyAgent';
  } else if (typeof http.setGlobalProxyFromEnv === 'function') {
    http.setGlobalProxyFromEnv(process.env);
    route.thisProcess = 'http.setGlobalProxyFromEnv';
  }

  const self = await probeThisProcess();
  if (self !== '204') {
    route.thisProcess = `not routed (${self}); npm install undici@7 in the scratch project`;
  }

  if (await runChild(PROBE, {...process.env}) === '204') {
    route.children = 'NODE_USE_ENV_PROXY=1';
  } else if (undici) {
    const routeFile = path.join(dir, 'route.cjs');
    fs.writeFileSync(routeFile, `'use strict';\nconst {setGlobalDispatcher, EnvHttpProxyAgent} = require(${JSON.stringify(undici)});\nsetGlobalDispatcher(new EnvHttpProxyAgent());\n`);
    process.env.NODE_OPTIONS = `${baseOptions} ${preload(routeFile)}`;
    const viaUndici = await runChild(PROBE, {...process.env});
    route.children = viaUndici === '204' ? 'undici EnvHttpProxyAgent preloaded' : `not routed (${viaUndici})`;
    if (viaUndici !== '204') {
      process.env.NODE_OPTIONS = baseOptions;
    }
  } else {
    route.children = `not routed; Node ${process.version} ignores NODE_USE_ENV_PROXY: npm install undici@7 in the scratch project`;
  }

  return {
    proxyUrl,
    env: {...process.env},
    route,
    connects,
    guardMessage: GUARD_MESSAGE,
    guardFile,
    report() {
      return [
        `capture proxy ${proxyUrl} on Node ${process.version}`,
        `guard: refused ${GUARD_TEST_HOST} here (net.connect, tls.connect) and in a child`,
        `fetch in this process: ${route.thisProcess}`,
        `fetch in child processes: ${route.children}`,
        '',
      ].join('\n');
    },
    async close() {
      proxy.closeAllConnections?.();
      await new Promise(resolve => {
        proxy.close(resolve);
      });
      fs.rmSync(dir, {recursive: true, force: true});
    },
  };
}

// Self-test: a plain server and a stand-in for the TLS server (routing is by port, so no certificate is needed),
// every request to an .invalid host, answered on 127.0.0.1.
async function selftest() {
  const answer = name => (request, response) => response.end(`${name} ${request.method} ${request.url} host=${request.headers.host}`);
  const plain = http.createServer(answer('plain'));
  const secure = http.createServer(answer('secure'));
  const failures = [];
  let passed = 0;
  const check = (label, ok, detail) => {
    if (ok) {
      passed++;
    } else {
      failures.push(`${label}: ${detail}`);
    }
  };

  const proxy = await startCaptureProxy({plain, secure});
  const {port} = new URL(proxy.proxyUrl);

  // Windows keeps one variable per name whatever its case, so a copy of process.env holds HTTP_PROXY only.
  const inEnv = name => proxy.env[name] ?? (process.platform === 'win32'
    ? Object.entries(proxy.env).find(([key]) => key.toUpperCase() === name.toUpperCase())?.[1]
    : undefined);
  for (const name of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']) {
    check(name, process.env[name] === proxy.proxyUrl && inEnv(name) === proxy.proxyUrl, `${process.env[name]} ${inEnv(name)}`);
  }

  for (const name of ['NO_PROXY', 'no_proxy']) {
    check(name, process.env[name] === LOOPBACK && inEnv(name) === LOOPBACK, JSON.stringify(inEnv(name)));
  }

  check('NODE_USE_ENV_PROXY', proxy.env.NODE_USE_ENV_PROXY === '1', proxy.env.NODE_USE_ENV_PROXY);
  check('NODE_OPTIONS', proxy.env.NODE_OPTIONS.includes(preload(proxy.guardFile)), proxy.env.NODE_OPTIONS);

  const refused = open => {
    try {
      const socket = open();
      socket.on('error', () => {});
      socket.destroy();
      return 'connected';
    } catch (error) {
      return error.message;
    }
  };

  for (const [label, open] of Object.entries({
    'guard net.connect(port, host)': () => net.connect(80, 'selftest.invalid'),
    'guard net.createConnection({host})': () => net.createConnection({host: 'selftest.invalid', port: 80}),
    'guard tls.connect': () => tls.connect(443, 'selftest.invalid'),
    'guard http.get': () => http.get({host: 'selftest.invalid', port: 80, agent: false}),
  })) {
    const result = refused(open);
    check(label, result.startsWith(GUARD_MESSAGE), result);
  }

  check('guard allows 127.0.0.1', refused(() => net.connect(Number(port), '127.0.0.1')) === 'connected', 'refused');

  // A raw CONNECT through the proxy, then one request over the tunnel.
  const tunnel = (target, requestPath) => new Promise(resolve => {
    const socket = net.connect(Number(port), '127.0.0.1');
    let data = '';
    let sent = false;
    socket.on('data', chunk => {
      data += chunk;
      if (!sent && data.includes('\r\n\r\n')) {
        sent = true;
        data = '';
        socket.write(`GET ${requestPath} HTTP/1.1\r\nHost: ${target.split(':')[0]}\r\nConnection: close\r\n\r\n`);
      }
    });
    socket.on('end', () => resolve(data.split('\r\n\r\n').slice(1).join('')));
    socket.on('error', error => resolve(error.message));
    socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\n`);
  });

  const viaTls = await tunnel('selftest.invalid:443', '/t');
  check('CONNECT :443 goes to the TLS server', viaTls.startsWith('secure GET /t'), viaTls);
  const via80 = await tunnel('selftest.invalid:80', '/p');
  check('CONNECT :80 goes to the plain server', via80.startsWith('plain GET /p'), via80);
  const via8080 = await tunnel('selftest.invalid:8080', '/q');
  check('CONNECT :8080 goes to the plain server', via8080.startsWith('plain GET /q'), via8080);

  // request 2.88's http link: the absolute URL sent to the proxy with the default agent. The line must arrive as sent,
  // here and in a child where NODE_USE_ENV_PROXY=1 is in effect (NO_PROXY keeps loopback direct).
  const absoluteForm = (proxyPort, who) => new Promise(resolve => {
    const request = require('node:http').request({host: '127.0.0.1', port: proxyPort, path: `http://selftest.invalid/abs-${who}`, headers: {host: 'selftest.invalid'}}, response => {
      let body = '';
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => resolve(body));
    });
    request.on('error', error => resolve(error.message));
    request.end();
  });
  const direct = await absoluteForm(Number(port), 'self');
  check('absolute-form request goes to the plain server unchanged', direct.startsWith('plain GET http://selftest.invalid/abs-self '), direct);
  const directChild = await runChild(`(${absoluteForm})(${port}, 'child').then(console.log)`, proxy.env);
  check('absolute-form request from a child goes to the plain server unchanged', directChild.startsWith('plain GET http://selftest.invalid/abs-child '), directChild);

  check('connects', proxy.connects.join(',') === 'CONNECT selftest.invalid:443,CONNECT selftest.invalid:80,CONNECT selftest.invalid:8080', proxy.connects.join(','));

  if (proxy.route.thisProcess.startsWith('not routed')) {
    console.log(`skip: fetch in this process is ${proxy.route.thisProcess}`);
  } else {
    const body = await fetch('http://selftest.invalid/fetch').then(response => response.text(), error => String(error.cause?.message ?? error.message));
    check(`fetch in this process (${proxy.route.thisProcess})`, body.startsWith('plain GET /fetch host=selftest.invalid'), body);
  }

  if (proxy.route.children.startsWith('not routed')) {
    console.log(`skip: fetch in children is ${proxy.route.children}`);
  } else {
    const body = await runChild("fetch('http://selftest.invalid/child').then(r => r.text()).then(console.log, e => console.log(String(e.cause?.message ?? e.message)))", proxy.env);
    check(`fetch in a child (${proxy.route.children})`, body.startsWith('plain GET /child host=selftest.invalid'), body);
  }

  const childGuard = await runChild("try { require('node:http').get({host: 'selftest.invalid', port: 80, agent: false}); console.log('connected'); } catch (error) { console.log(error.message); }", proxy.env);
  check('guard in a child (http.get)', childGuard.startsWith(GUARD_MESSAGE), childGuard);

  process.stdout.write(proxy.report());
  await proxy.close();
  check('close removes the temporary folder', !fs.existsSync(path.dirname(proxy.guardFile)), path.dirname(proxy.guardFile));

  if (failures.length > 0) {
    console.log(`selftest: ${failures.length} failed, ${passed} passed\n${failures.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`selftest: ${passed} checks passed`);
  }
}

module.exports = {startCaptureProxy, GUARD_MESSAGE};

if (require.main === module && process.argv.includes('--selftest')) {
  selftest().catch(error => {
    console.log(`selftest: ${error.stack}`);
    process.exitCode = 1;
  });
}
