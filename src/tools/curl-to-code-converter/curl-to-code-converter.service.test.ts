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

  // -F / --form values must never be mistaken for the URL, regardless of
  // where the flag sits relative to the URL (multipart bodies are not
  // captured by parseCurl; the flag is ignored, the URL must survive).
  it('parses -F before the URL without corrupting it', () => {
    const result = parseCurl('curl -F file=@photo.png https://api.example.com/upload');
    expect(result.url).toBe('https://api.example.com/upload');
    expect(result.method).toBe('GET');
    expect(result.body).toBeNull();
  });

  it('parses -F after the URL', () => {
    const result = parseCurl('curl https://api.example.com/upload -F file=@photo.png');
    expect(result.url).toBe('https://api.example.com/upload');
    expect(result.method).toBe('GET');
  });

  it('parses --form before the URL', () => {
    const result = parseCurl('curl --form file=@photo.png https://api.example.com/upload');
    expect(result.url).toBe('https://api.example.com/upload');
  });

  it('parses -F with a quoted value before the URL', () => {
    const result = parseCurl('curl -F "file=@my photo.png" https://api.example.com/upload');
    expect(result.url).toBe('https://api.example.com/upload');
  });

  it('parses -o, -A and -e before the URL without corrupting it', () => {
    expect(parseCurl('curl -o out.json https://api.example.com/data').url).toBe(
      'https://api.example.com/data',
    );
    expect(parseCurl('curl -A "Mozilla/5.0" https://api.example.com/data').url).toBe(
      'https://api.example.com/data',
    );
    // -e takes a URL as its value: it must not win over the real URL.
    expect(
      parseCurl('curl -e https://referrer.example.com https://api.example.com/data').url,
    ).toBe('https://api.example.com/data');
  });

  // --json takes an OPTIONAL value in real curl (`--json [data]`), so the
  // common form `curl --json <url>` must not eat the URL as a flag value.
  it('parses --json before the URL without eating it', () => {
    const result = parseCurl('curl --json https://api.example.com/data');
    expect(result.url).toBe('https://api.example.com/data');
    expect(result.method).toBe('GET');
  });

  it('parses --url form', () => {
    const result = parseCurl('curl --url https://api.example.com/data');
    expect(result.url).toBe('https://api.example.com/data');
  });

  it('parses --url= attached form', () => {
    const result = parseCurl('curl --url=https://api.example.com/data');
    expect(result.url).toBe('https://api.example.com/data');
  });

  it('parses --dns-servers, --connect-to, --tls-max, --mail-from and --mail-rcpt before the URL', () => {
    expect(parseCurl('curl --dns-servers 8.8.8.8 https://api.example.com/data').url).toBe(
      'https://api.example.com/data',
    );
    expect(
      parseCurl(
        'curl --connect-to api.example.com:443:internal.example.com:443 https://api.example.com/data',
      ).url,
    ).toBe('https://api.example.com/data');
    expect(parseCurl('curl --tls-max 1.2 https://api.example.com/data').url).toBe(
      'https://api.example.com/data',
    );
    expect(parseCurl('curl --mail-from user@example.com https://api.example.com/data').url).toBe(
      'https://api.example.com/data',
    );
    expect(parseCurl('curl --mail-rcpt rcpt@example.com https://api.example.com/data').url).toBe(
      'https://api.example.com/data',
    );
  });

  it('parses -H and -d before the URL', () => {
    const result = parseCurl(
      `curl -H "Authorization: Bearer abc" -d '{"a":1}' https://api.example.com/data`,
    );
    expect(result.url).toBe('https://api.example.com/data');
    expect(result.method).toBe('POST');
    expect(result.headers['Authorization']).toBe('Bearer abc');
  });
});
