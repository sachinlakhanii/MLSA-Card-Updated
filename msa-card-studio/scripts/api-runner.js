// Fresh local request workers reload the API and all template dependencies.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
const endpoints = ['publish', 'members', 'member', 'delete', 'site'];
export function runLocalHandler(name, request, env = process.env) {
  if (!endpoints.includes(name)) throw new Error('Unknown API endpoint');
  return new Promise((resolve, reject) => {
    let responded = false;
    const worker = new Worker(new URL(import.meta.url), { workerData: { name, request }, env });
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('API timeout')); }, 45000);
    worker.once('message', result => { responded = true; clearTimeout(timer); resolve(result); });
    worker.once('error', error => { clearTimeout(timer); reject(error); });
    worker.once('exit', code => { clearTimeout(timer); if (code || !responded) reject(new Error('API worker failed')); });
  });
}
if (!isMainThread) {
  if (!endpoints.includes(workerData.name)) throw new Error('Unknown API endpoint');
  const { default: handler } = await import('../api/' + workerData.name + '.js');
  const result = { status: 200, headers: {}, body: null };
  const response = {
    setHeader(name, value) { result.headers[name] = value; },
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; return this; }
  };
  await handler(workerData.request, response);
  parentPort.postMessage(result);
  parentPort.close();
}
