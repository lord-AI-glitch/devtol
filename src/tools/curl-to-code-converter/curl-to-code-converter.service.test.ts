import { describe, expect, it } from 'vitest';
import {
  generateCode,
  parseCurl,
} from './curl-to-code-converter.service';

describe('curl-to-code-converter.service', () => {
  it('parses a simple GET request', () => {
    const curl = 'curl https://api.github.com/users/octocat';
    const result = parseCurl(curl);
    expect(result.method).toBe('GET');
    expect(result.url).toBe('https://api.github.com/users/octocat');
    expect(result.body).toBeNull();
    expect(result.auth.type).toBe('none');
  });

  it('parses multiline POST request with headers and JSON body', () => {
    const curl = `curl -X POST https://api.example.com/v1/items \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer my-secret-token" \\
      -d '{"title": "DevTol Suite", "score": 99}'`;

    const result = parseCurl(curl);
    expect(result.method).toBe('POST');
    expect(result.url).toBe('https://api.example.com/v1/items');
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers['Authorization']).toBe('Bearer my-secret-token');
    expect(result.isJsonBody).toBe(true);
    expect(result.parsedJson).toEqual({ title: 'DevTol Suite', score: 99 });
    expect(result.auth.type).toBe('bearer');
    expect(result.auth.token).toBe('my-secret-token');
  });

  it('parses basic authentication flag -u', () => {
    const curl = 'curl -u "admin:secretPass123" https://api.example.com/admin/status';
    const result = parseCurl(curl);
    expect(result.auth.type).toBe('basic');
    expect(result.auth.user).toBe('admin');
    expect(result.auth.pass).toBe('secretPass123');
  });

  it('generates idiomatic Python code with requests and httpx', () => {
    const parsed = parseCurl(`curl -X POST https://httpbin.org/post -H "X-Custom: Value" -d '{"ping": "pong"}'`);

    const pyRequests = generateCode(parsed, 'python', { library: 'requests' });
    expect(pyRequests).toContain('import requests');
    expect(pyRequests).toContain('requests.post');
    expect(pyRequests).toContain('json=payload');

    const pyHttpx = generateCode(parsed, 'python', { library: 'httpx' });
    expect(pyHttpx).toContain('import httpx');
    expect(pyHttpx).toContain('client.post');
  });

  it('generates idiomatic JavaScript and TypeScript code with fetch and axios', () => {
    const parsed = parseCurl(`curl https://api.github.com/zen`);

    const jsFetch = generateCode(parsed, 'javascript', { library: 'fetch' });
    expect(jsFetch).toContain('await fetch');
    expect(jsFetch).toContain('method: \'GET\'');

    const tsAxios = generateCode(parsed, 'typescript', { library: 'axios' });
    expect(tsAxios).toContain('import axios');
    expect(tsAxios).toContain(': Promise<void>');
    expect(tsAxios).toContain('axios({');
  });

  it('generates standard Go net/http code', () => {
    const parsed = parseCurl(`curl -X DELETE https://api.example.com/items/42 -H "Accept: application/json"`);
    const goCode = generateCode(parsed, 'go');
    expect(goCode).toContain('package main');
    expect(goCode).toContain('http.NewRequest("DELETE"');
    expect(goCode).toContain('client.Do(req)');
  });

  it('generates modern Rust reqwest code', () => {
    const parsed = parseCurl(`curl https://api.example.com/health`);
    const rustCode = generateCode(parsed, 'rust');
    expect(rustCode).toContain('reqwest::Client::new()');
    expect(rustCode).toContain('.send()');
  });
});
