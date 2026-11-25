export interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  isJsonBody: boolean;
  parsedJson: any | null;
  auth: {
    type: 'none' | 'basic' | 'bearer';
    user?: string;
    pass?: string;
    token?: string;
  };
}

export type TargetLanguage = 'python' | 'javascript' | 'typescript' | 'go' | 'php' | 'rust' | 'java' | 'dart';

/**
 * curl flags that take a value but whose values parseCurl does not use
 * (multipart form fields, output file, user-agent, timeouts, ...).
 * Their values must be skipped, otherwise a value containing '.' (or a URL,
 * e.g. a referer/proxy) is mistaken for the request URL by the positional
 * fallback in parseCurl. `--url` is intentionally excluded: its value IS
 * the URL. `--json` is also excluded: real curl takes it with an OPTIONAL
 * value (`--json [data]`), so `curl --json <url>` must not eat the URL as a
 * flag value. Attached forms (`--form=name=value`, `-Ffile=@x`) need no entry:
 * they start with '-' and are skipped by the fallback already.
 */
const IGNORED_VALUE_FLAGS: ReadonlySet<string> = new Set([
  '-F',
  '--form',
  '--form-string',
  '-o',
  '--output',
  '-A',
  '--user-agent',
  '-e',
  '--referer',
  '-b',
  '--cookie',
  '-c',
  '--cookie-jar',
  '-T',
  '--upload-file',
  '--connect-timeout',
  '--max-time',
  '-m',
  '--retry',
  '--cacert',
  '--cert',
  '--key',
  '--proxy',
  '-x',
  '-w',
  '--write-out',
  '-D',
  '--dump-header',
  '--resolve',
  '--oauth2-bearer',
  '--dns-servers',
  '--connect-to',
  '--tls-max',
  '--mail-from',
  '--mail-rcpt',
  '--mail-auth',
  '--capath',
  '--interface',
  '--output-dir',
  '--retry-delay',
]);

/**
 * Robustly parses a cURL command string into structured HTTP request components.
 * Handles multiline commands, shell quoting (' and "), various data flags, and auth types.
 */
export function parseCurl(command: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: null,
    isJsonBody: false,
    parsedJson: null,
    auth: { type: 'none' },
  };

  if (!command || !command.trim()) {
    return result;
  }

  // Normalize multiline backslashes and carriage returns
  const normalized = command
    .replace(/\\\r?\n/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();

  // Tokenize preserving single and double quotes
  const tokens: string[] = [];
  const tokenRegex = /[^\s"']+|"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  let match;
  while ((match = tokenRegex.exec(normalized)) !== null) {
    if (match[1] !== undefined) {
      tokens.push(match[1].replace(/\\"/g, '"'));
    } else if (match[2] !== undefined) {
      tokens.push(match[2].replace(/\\'/g, "'"));
    } else {
      tokens.push(match[0]);
    }
  }

  let explicitMethod: string | null = null;
  const bodyParts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1] || '';

    // Ignore binary name
    if (token.toLowerCase() === 'curl' || token.toLowerCase() === 'curl.exe') {
      continue;
    }

    // Method flag: -X, --request
    if (token === '-X' || token === '--request') {
      explicitMethod = nextToken.toUpperCase();
      i++;
      continue;
    }

    // Headers flag: -H, --header
    if (token === '-H' || token === '--header') {
      if (nextToken) {
        const colonIdx = nextToken.indexOf(':');
        if (colonIdx > 0) {
          const key = nextToken.substring(0, colonIdx).trim();
          const val = nextToken.substring(colonIdx + 1).trim();
          result.headers[key] = val;
        }
      }
      i++;
      continue;
    }

    // User / Basic Auth: -u, --user
    if (token === '-u' || token === '--user') {
      if (nextToken) {
        const colonIdx = nextToken.indexOf(':');
        if (colonIdx >= 0) {
          result.auth = {
            type: 'basic',
            user: nextToken.substring(0, colonIdx),
            pass: nextToken.substring(colonIdx + 1),
          };
        } else {
          result.auth = {
            type: 'basic',
            user: nextToken,
            pass: '',
          };
        }
      }
      i++;
      continue;
    }

    // Body / Data flags: -d, --data, --data-raw, --data-binary, --data-urlencode
    if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary' ||
      token === '--data-urlencode' ||
      token === '--data-ascii'
    ) {
      if (nextToken) {
        bodyParts.push(nextToken);
      }
      i++;
      continue;
    }

    // Other value-taking flags the parser otherwise ignores: skip the flag
    // AND its value, or the value is mistaken for the positional URL by the
    // fallback below (e.g. `-F file=@photo.png` before the URL used to yield
    // `https://file=@photo.png`, and `-o out.json` yielded `https://out.json`).
    // --url is deliberately NOT in this set: its value IS the URL, so it is
    // left to fall through to the URL detection below.
    if (IGNORED_VALUE_FLAGS.has(token)) {
      i++;
      continue;
    }

    // Attached form: --url=<url> carries the request URL itself (unlike the
    // flags above, its value must NOT be skipped).
    if (token.startsWith('--url=')) {
      if (!result.url) {
        const urlValue = token.slice('--url='.length);
        if (urlValue) {
          result.url = urlValue.startsWith('http') ? urlValue : `https://${urlValue}`;
        }
      }
      continue;
    }

    // URL detection: http:// or https:// or positional URL
    if (
      (token.startsWith('http://') || token.startsWith('https://')) &&
      !result.url
    ) {
      result.url = token;
      continue;
    }

    // If it's not a flag (doesn't start with -) and looks like a domain/path
    if (!token.startsWith('-') && !result.url && (token.includes('.') || token.includes('localhost'))) {
      result.url = token.startsWith('http') ? token : `https://${token}`;
    }
  }

  // Combine body parts if multiple
  if (bodyParts.length > 0) {
    result.body = bodyParts.join('&');
  }

  // Determine method: if data exists and no explicit method set, default to POST
  if (explicitMethod) {
    result.method = explicitMethod;
  } else if (result.body) {
    result.method = 'POST';
  } else {
    result.method = 'GET';
  }

  // Inspect Authorization header for Bearer or Basic if not already caught
  for (const [k, v] of Object.entries(result.headers)) {
    if (k.toLowerCase() === 'authorization' && result.auth.type === 'none') {
      if (v.toLowerCase().startsWith('bearer ')) {
        result.auth = {
          type: 'bearer',
          token: v.substring(7).trim(),
        };
      }
    }
  }

  // Check if body is JSON
  if (result.body) {
    try {
      result.parsedJson = JSON.parse(result.body);
      result.isJsonBody = true;
    } catch {
      result.isJsonBody = false;
      result.parsedJson = null;
    }
  }

  return result;
}

export interface GenerationOptions {
  library?: string; // e.g. 'requests' vs 'httpx' for Python; 'fetch' vs 'axios' for JS
}

/**
 * Generates production-ready code in the selected target language.
 */
export function generateCode(
  parsed: ParsedCurl,
  language: TargetLanguage,
  options: GenerationOptions = {},
): string {
  const url = parsed.url || 'https://api.example.com/endpoint';
  const method = parsed.method;
  const headers = parsed.headers;
  const body = parsed.body;
  const isJson = parsed.isJsonBody;

  switch (language) {
    case 'python':
      return generatePython(parsed, options.library || 'requests');
    case 'javascript':
    case 'typescript':
      return generateJavaScript(parsed, options.library || 'fetch', language === 'typescript');
    case 'go':
      return generateGo(parsed);
    case 'php':
      return generatePhp(parsed, options.library || 'curl');
    case 'rust':
      return generateRust(parsed);
    case 'java':
      return generateJava(parsed);
    case 'dart':
      return generateDart(parsed);
    default:
      return generatePython(parsed, 'requests');
  }
}

function generatePython(parsed: ParsedCurl, library: string): string {
  const { method, url, headers, body, isJsonBody: isJson, auth } = parsed;

  if (library === 'httpx') {
    let code = `import httpx\n\n`;
    code += `url = "${url}"\n\n`;

    if (Object.keys(headers).length > 0) {
      code += `headers = ${JSON.stringify(headers, null, 4)}\n\n`;
    }

    if (isJson && parsed.parsedJson) {
      code += `data = ${JSON.stringify(parsed.parsedJson, null, 4)}\n\n`;
    } else if (body) {
      code += `data = """${body}"""\n\n`;
    }

    code += `with httpx.Client() as client:\n`;
    code += `    response = client.${method.toLowerCase()}(\n`;
    code += `        url,\n`;
    if (Object.keys(headers).length > 0) code += `        headers=headers,\n`;
    if (isJson) code += `        json=data,\n`;
    else if (body) code += `        content=data,\n`;
    if (auth.type === 'basic') code += `        auth=("${auth.user}", "${auth.pass}"),\n`;
    code += `    )\n\n`;
    code += `print(response.status_code)\n`;
    code += `print(response.text)\n`;
    return code;
  }

  // Default: requests
  let code = `import requests\n\n`;
  code += `url = "${url}"\n\n`;

  if (Object.keys(headers).length > 0) {
    code += `headers = ${JSON.stringify(headers, null, 4)}\n\n`;
  }

  if (isJson && parsed.parsedJson) {
    code += `payload = ${JSON.stringify(parsed.parsedJson, null, 4)}\n\n`;
  } else if (body) {
    code += `payload = """${body}"""\n\n`;
  }

  code += `response = requests.${method.toLowerCase()}(\n`;
  code += `    url,\n`;
  if (Object.keys(headers).length > 0) code += `    headers=headers,\n`;
  if (isJson) code += `    json=payload,\n`;
  else if (body) code += `    data=payload,\n`;
  if (auth.type === 'basic') code += `    auth=("${auth.user}", "${auth.pass}"),\n`;
  code += `)\n\n`;
  code += `print(f"Status Code: {response.status_code}")\n`;
  code += `print(response.text)\n`;
  return code;
}

function generateJavaScript(parsed: ParsedCurl, library: string, isTs: boolean): string {
  const { method, url, headers, body, isJsonBody: isJson } = parsed;

  if (library === 'axios') {
    let code = `import axios from 'axios';\n\n`;
    code += `async function makeRequest()${isTs ? ': Promise<void>' : ''} {\n`;
    code += `  try {\n`;
    code += `    const response = await axios({\n`;
    code += `      method: '${method.toLowerCase()}',\n`;
    code += `      url: '${url}',\n`;
    if (Object.keys(headers).length > 0) {
      code += `      headers: ${JSON.stringify(headers, null, 8).trim()},\n`;
    }
    if (isJson && parsed.parsedJson) {
      code += `      data: ${JSON.stringify(parsed.parsedJson, null, 8).trim()},\n`;
    } else if (body) {
      code += `      data: '${body.replace(/'/g, "\\'")}',\n`;
    }
    code += `    });\n\n`;
    code += `    console.log(response.status);\n`;
    code += `    console.log(response.data);\n`;
    code += `  } catch (error) {\n`;
    code += `    console.error('Request failed:', error);\n`;
    code += `  }\n`;
    code += `}\n\n`;
    code += `makeRequest();\n`;
    return code;
  }

  // Default: fetch
  let code = `async function makeRequest()${isTs ? ': Promise<void>' : ''} {\n`;
  code += `  const response = await fetch('${url}', {\n`;
  code += `    method: '${method}',\n`;

  if (Object.keys(headers).length > 0) {
    code += `    headers: ${JSON.stringify(headers, null, 6).trim()},\n`;
  }

  if (isJson && parsed.parsedJson) {
    code += `    body: JSON.stringify(${JSON.stringify(parsed.parsedJson, null, 6).trim()}),\n`;
  } else if (body) {
    code += `    body: '${body.replace(/'/g, "\\'")}',\n`;
  }

  code += `  });\n\n`;
  code += `  const data = await response.json();\n`;
  code += `  console.log(data);\n`;
  code += `}\n\n`;
  code += `makeRequest();\n`;
  return code;
}

function generateGo(parsed: ParsedCurl): string {
  const { method, url, headers, body } = parsed;

  let code = `package main\n\n`;
  code += `import (\n`;
  if (body) code += `\t"bytes"\n`;
  code += `\t"fmt"\n`;
  code += `\t"io"\n`;
  code += `\t"net/http"\n`;
  code += `)\n\n`;
  code += `func main() {\n`;

  if (body) {
    code += `\tpayload := []byte(\`${body}\`)\n`;
    code += `\treq, err := http.NewRequest("${method}", "${url}", bytes.NewBuffer(payload))\n`;
  } else {
    code += `\treq, err := http.NewRequest("${method}", "${url}", nil)\n`;
  }

  code += `\tif err != nil {\n`;
  code += `\t\tpanic(err)\n`;
  code += `\t}\n\n`;

  for (const [k, v] of Object.entries(headers)) {
    code += `\treq.Header.Set("${k}", "${v}")\n`;
  }

  code += `\n\tclient := &http.Client{}\n`;
  code += `\tresp, err := client.Do(req)\n`;
  code += `\tif err != nil {\n`;
  code += `\t\tpanic(err)\n`;
  code += `\t}\n`;
  code += `\tdefer resp.Body.Close()\n\n`;
  code += `\tbody, _ := io.ReadAll(resp.Body)\n`;
  code += `\tfmt.Println("Status:", resp.Status)\n`;
  code += `\tfmt.Println(string(body))\n`;
  code += `}\n`;
  return code;
}

function generatePhp(parsed: ParsedCurl, library: string): string {
  const { method, url, headers, body } = parsed;

  if (library === 'guzzle') {
    let code = `<?php\nrequire 'vendor/autoload.php';\n\n`;
    code += `use GuzzleHttp\\Client;\n\n`;
    code += `$client = new Client();\n`;
    code += `$response = $client->request('${method}', '${url}', [\n`;
    if (Object.keys(headers).length > 0) {
      code += `    'headers' => [\n`;
      for (const [k, v] of Object.entries(headers)) {
        code += `        '${k}' => '${v}',\n`;
      }
      code += `    ],\n`;
    }
    if (parsed.isJsonBody && parsed.parsedJson) {
      code += `    'json' => ${JSON.stringify(parsed.parsedJson)},\n`;
    } else if (body) {
      code += `    'body' => '${body.replace(/'/g, "\\'")}',\n`;
    }
    code += `]);\n\n`;
    code += `echo $response->getBody();\n`;
    return code;
  }

  // Default: native curl
  let code = `<?php\n\n$curl = curl_init();\n\n`;
  code += `curl_setopt_array($curl, [\n`;
  code += `    CURLOPT_URL => "${url}",\n`;
  code += `    CURLOPT_RETURNTRANSFER => true,\n`;
  code += `    CURLOPT_CUSTOMREQUEST => "${method}",\n`;

  if (body) {
    code += `    CURLOPT_POSTFIELDS => '${body.replace(/'/g, "\\'")}',\n`;
  }

  if (Object.keys(headers).length > 0) {
    code += `    CURLOPT_HTTPHEADER => [\n`;
    for (const [k, v] of Object.entries(headers)) {
      code += `        "${k}: ${v}",\n`;
    }
    code += `    ],\n`;
  }

  code += `]);\n\n`;
  code += `$response = curl_exec($curl);\n`;
  code += `$err = curl_error($curl);\n\n`;
  code += `curl_close($curl);\n\n`;
  code += `if ($err) {\n    echo "cURL Error: " . $err;\n} else {\n    echo $response;\n}\n`;
  return code;
}

function generateRust(parsed: ParsedCurl): string {
  const { method, url, headers, body } = parsed;

  let code = `use reqwest::header::{HeaderMap, HeaderName, HeaderValue};\n\n`;
  code += `#[tokio::main]\n`;
  code += `async fn main() -> Result<(), Box<dyn std::error::Error>> {\n`;
  code += `    let client = reqwest::Client::new();\n\n`;
  code += `    let response = client.${method.toLowerCase()}("${url}")\n`;

  for (const [k, v] of Object.entries(headers)) {
    code += `        .header("${k}", "${v}")\n`;
  }

  if (parsed.isJsonBody && parsed.parsedJson) {
    code += `        .json(&serde_json::json!(${JSON.stringify(parsed.parsedJson)}))\n`;
  } else if (body) {
    code += `        .body(r#"${body}"#)\n`;
  }

  code += `        .send()\n`;
  code += `        .await?;\n\n`;
  code += `    let status = response.status();\n`;
  code += `    let body_text = response.text().await?;\n\n`;
  code += `    println!("Status: {}", status);\n`;
  code += `    println!("{}", body_text);\n`;
  code += `    Ok(())\n`;
  code += `}\n`;
  return code;
}

function generateJava(parsed: ParsedCurl): string {
  const { method, url, headers, body } = parsed;

  let code = `import java.net.URI;\n`;
  code += `import java.net.http.HttpClient;\n`;
  code += `import java.net.http.HttpRequest;\n`;
  code += `import java.net.http.HttpResponse;\n\n`;
  code += `public class App {\n`;
  code += `    public static void main(String[] args) throws Exception {\n`;
  code += `        HttpClient client = HttpClient.newHttpClient();\n\n`;
  code += `        HttpRequest request = HttpRequest.newBuilder()\n`;
  code += `            .uri(URI.create("${url}"))\n`;

  for (const [k, v] of Object.entries(headers)) {
    code += `            .header("${k}", "${v}")\n`;
  }

  if (body) {
    code += `            .method("${method}", HttpRequest.BodyPublishers.ofString("${body.replace(/"/g, '\\"')}"))\n`;
  } else {
    code += `            .method("${method}", HttpRequest.BodyPublishers.noBody())\n`;
  }

  code += `            .build();\n\n`;
  code += `        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n`;
  code += `        System.out.println("Status: " + response.statusCode());\n`;
  code += `        System.out.println(response.body());\n`;
  code += `    }\n`;
  code += `}\n`;
  return code;
}

function generateDart(parsed: ParsedCurl): string {
  const { method, url, headers, body } = parsed;

  let code = `import 'package:http/http.dart' as http;\n\n`;
  code += `void main() async {\n`;
  code += `  final url = Uri.parse('${url}');\n`;

  if (Object.keys(headers).length > 0) {
    code += `  final headers = ${JSON.stringify(headers, null, 4)};\n`;
  }

  if (body) {
    code += `  final body = '${body.replace(/'/g, "\\'")}';\n`;
  }

  code += `\n  final response = await http.${method.toLowerCase()}(\n`;
  code += `    url,\n`;
  if (Object.keys(headers).length > 0) code += `    headers: headers,\n`;
  if (body) code += `    body: body,\n`;
  code += `  );\n\n`;
  code += `  print('Status: \${response.statusCode}');\n`;
  code += `  print(response.body);\n`;
  code += `}\n`;
  return code;
}

export const SAMPLE_CURLS = [
  {
    name: 'POST JSON with Bearer Token',
    curl: `curl -X POST https://api.example.com/v1/projects \\
  -H "Authorization: Bearer sk-live-EXAMPLE" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "DevTol Modern Suite", "active": true, "tags": ["productivity", "tools"]}'`,
  },
  {
    name: 'GET with Custom Headers & Query',
    curl: `curl -X GET "https://api.github.com/repos/CorentinTh/it-tools/issues?state=open&sort=created" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -H "User-Agent: DevTol-Agent/1.0"`,
  },
  {
    name: 'Basic Auth POST Request',
    curl: `curl -X POST https://api.stripe.com/v1/customers \\
  -u "sk_test_51Mzxyz...:" \\
  -d "email=developer@devtol.online" \\
  -d "description=DevTol Subscriber"`,
  },
];
