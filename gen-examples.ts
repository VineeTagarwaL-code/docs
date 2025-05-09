import "dotenv/config";
import fs from "fs";
import { CurlGenerator } from "curl-generator";
import * as curlconverter from "curlconverter";

const url = "https://jigsawstack-git-new-ui-jigsaw-stack.vercel.app/api/v1";

interface APIType {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  sdk_key_string: string;
  skip_request?: boolean;
}

const APISchemas: {
  [key: string]: APIType;
} = {
  "ai-scrape": {
    path: "/ai/scrape",
    method: "POST",
    body: {
      url: "https://news.ycombinator.com/news",
      element_prompts: ["titles", "points"],
    },
    sdk_key_string: "web.ai_scrape",
  },
  sentiment: {
    path: "/ai/sentiment",
    method: "POST",
    body: {
      text: "I love this product! It's amazing but the delivery was a bit late.",
    },
    sdk_key_string: "sentiment",
  },
  translate: {
    path: "/ai/translate",
    method: "POST",
    body: {
      text: ["Hello", "How are you?", "Thank you"],
      target_language: "zh",
    },
    sdk_key_string: "translate",
  },
  summary: {
    path: "/ai/summary",
    method: "POST",
    body: {
      text: "The Leaning Tower of Pisa, or simply, the Tower of Pisa, is the campanile, or freestanding bell tower, of Pisa Cathedral. It is situated behind the Cathedral and is the third-oldest structure in the city's Cathedral Square, after the Cathedral and the Baptistry. The tower's tilt began during construction in the 12th century, caused by an inadequate foundation on ground too soft on one side to properly support the structure's weight. The tilt increased in the decades before the structure was completed in the 14th century. It gradually increased until the structure was stabilized by efforts in the late 20th and early 21st centuries. The height of the tower is 55.86 metres (183.27 feet) from the ground on the low side and 56.67 metres (185.93 feet) on the high side. The width of the walls at the base is 2.44 m (8 ft 0.06 in). Its weight is estimated at 14,500 tonnes. The tower has 296 or 294 steps; the seventh floor has two fewer steps on the north-facing staircase.",
      type: "points",
      max_points: 3,
    },
    sdk_key_string: "summary",
  },
  prediction: {
    path: "/ai/prediction",
    method: "POST",
    body: {
      dataset: [
        { date: "2023-01-01", value: 353459 },
        { date: "2023-01-02", value: 313734 },
        { date: "2023-01-03", value: 333774 },
        { date: "2023-01-04", value: 348636 },
        { date: "2023-01-05", value: 278903 },
      ],
      steps: 3,
    },
    sdk_key_string: "prediction",
  },
  sql: {
    path: "/ai/sql",
    method: "POST",
    body: {
      database: "postgresql",
      prompt: "Find all transactions with amounts exceeding $10,000, sorted by transaction date",
      sql_schema: `
          CREATE TABLE Transactions (
            transaction_id INT PRIMARY KEY, 
            user_id INT NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL, 
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20) DEFAULT 'pending',
            FOREIGN KEY(user_id) REFERENCES Users(user_id)
          )
        `,
    },
    sdk_key_string: "text_to_sql",
  },
  "ai-search": {
    path: "/web/search",
    method: "POST",
    body: {
      query: "What is the capital of France?",
    },
    sdk_key_string: "web.search",
  },
  "search-suggestions": {
    path: "/web/search/suggest",
    method: "GET",
    query: {
      query: "What is the capital",
    },
    sdk_key_string: "web.search_suggestions",
  },
  embedding: {
    path: "/embedding",
    method: "POST",
    body: {
      text: "Caption: Secluded Tiki Bar on a serene lake, perfect for a refreshing drink and a relaxing getaway",
      type: "text",
    },
    sdk_key_string: "embedding",
  },
  "object-detection": {
    path: "/ai/object_detection",
    method: "POST",
    body: {
      url: "https://rogilvkqloanxtvjfrkm.supabase.co/storage/v1/object/public/demo/Collabo%201080x842.jpg?t=2024-03-22T09%3A22%3A48.442Z",
    },
    sdk_key_string: "vision.object_detection",
  },
  vocr: {
    path: "/vocr",
    method: "POST",
    body: {
      prompt: ["total_price", "tax"],
      url: "https://media.snopes.com/2021/08/239918331_10228097135359041_3825446756894757753_n.jpg",
    },
    sdk_key_string: "vision.vocr",
  },
  "speech-to-text": {
    path: "/ai/transcribe",
    method: "POST",
    body: {
      url: "https://jigsawstack.com/preview/stt-example.wav",
    },
    sdk_key_string: "audio.speech_to_text",
  },
  "spam-check": {
    path: "/validate/spam_check",
    method: "POST",
    body: {
      text: "Congratulations! You've won a free iPhone! Click here to claim now!",
    },
    sdk_key_string: "validate.spam_check",
  },
  nsfw: {
    path: "/validate/nsfw",
    method: "POST",
    body: {
      url: "https://images.unsplash.com/photo-1633998979521-11ca9d0e6e38?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    sdk_key_string: "validate.nsfw",
  },
  profanity: {
    path: "/validate/profanity",
    method: "POST",
    body: {
      text: "This is a sample text that might contain inappropriate language.",
    },
    sdk_key_string: "validate.profanity",
  },
  spellcheck: {
    path: "/validate/spell_check",
    method: "POST",
    body: {
      text: "This sentense has a speling mistake.",
    },
    sdk_key_string: "validate.spellcheck",
  },
  // "file-add": {
  //   path: "/store/file/",
  //   method: "POST",
  //   body: {
  //     file: "base64encodedfilecontentorurl",
  //     metadata: {
  //       filename: "sample.pdf",
  //       contentType: "application/pdf",
  //     },
  //   },
  //   sdk_key_string: "store.file.add",
  // },
  "file-get": {
    path: "/store/file/read/image-123.png",
    method: "GET",
    query: {
      key: "image-123.png",
    },
    sdk_key_string: "store.file.get",
  },
  "file-delete": {
    path: "/store/file/read/image-123.png",
    method: "DELETE",
    query: {
      key: "image-123.png",
    },
    sdk_key_string: "store.file.delete",
    skip_request: true,
  },
  "prompt-engine-create": {
    path: "/prompt_engine",
    method: "POST",
    body: {
      prompt: "Tell me a story about {about}",
      inputs: [
        {
          key: "about",
          optional: false,
          initial_value: "Leaning Tower of Pisa",
        },
      ],
      return_prompt: "Return the result in a markdown format",
      prompt_guard: ["sexual_content", "defamation"],
    },
    sdk_key_string: "prompt_engine.create",
  },
  "prompt-engine-run": {
    path: "/prompt_engine/0073d008-da9b-4c27-90a8-0240f3ecd4f5",
    method: "POST",
    query: {
      id: "0073d008-da9b-4c27-90a8-0240f3ecd4f5",
    },
    body: {
      input_values: {
        text: "How to get started with JigsawStack?",
      },
    },
    sdk_key_string: "prompt_engine.run",
  },
  "prompt-engine-retrieve": {
    path: "/prompt_engine/14d675d5-b309-463d-8906-1be65af74c43",
    method: "GET",
    query: {
      id: "14d675d5-b309-463d-8906-1be65af74c43",
    },
    sdk_key_string: "prompt_engine.get",
  },
  "prompt-engine-list": {
    path: "/prompt_engine",
    method: "GET",
    query: {
      limit: "10",
    },
    sdk_key_string: "prompt_engine.list",
  },
  "prompt-engine-delete": {
    path: "/prompt_engine/${id}",
    method: "DELETE",
    query: {
      promptId: "dc578c69-6eb5-4c5b-82ab-9f74077cfdd5",
    },
    sdk_key_string: "prompt_engine.delete",
    skip_request: true,
  },
  "prompt-engine-run-direct": {
    path: "/prompt_engine/run",
    method: "POST",
    body: {
      prompt: "Tell me a story about {about}",
      inputs: [
        {
          key: "about",
          optional: false,
          initial_value: "Leaning Tower of Pisa",
        },
      ],
      return_prompt: "Return the result in a markdown format",
      prompt_guard: ["sexual_content", "defamation"],
      input_values: {
        about: "Santorini",
      },
    },
    sdk_key_string: "prompt_engine.run_direct",
  },
  "image-generation": {
    path: "/ai/image_generation",
    method: "POST",
    body: {
      prompt: "A beautiful sunset over a calm ocean",
    },
    sdk_key_string: "image_generation",
  },
  "image-translate": {
    path: "/ai/translate/image",
    method: "POST",
    body: {
      url: "https://images.unsplash.com/photo-1566657817181-c69e4a8eeb1e?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      target_language: "hi",
    },
    sdk_key_string: "translate.image",
  },
  "text-to-speech": {
    path: "/ai/tts",
    method: "POST",
    body: {
      text: "Hello, world!",
      accent: "en-US-female-27",
    },
    sdk_key_string: "audio.text_to_speech",
  },
  "html-to-any": {
    path: "/web/html_to_any",
    method: "POST",
    body: {
      url: "https://news.ycombinator.com/",
    },
    sdk_key_string: "web.html_to_any",
  },
};

const getSDKJSCode = (api: APIType) => {
  const JSSDKCode = `import { JigsawStack } from "jigsawstack";

const jigsaw = JigsawStack({ apiKey: "your-api-key" });

const response = await jigsaw.${api.sdk_key_string}(${JSON.stringify(
    {
      ...api?.body,
      ...api?.query,
    },
    null,
    6
  )})`;

  return JSSDKCode;
};

const getSDKPythonCode = (api: APIType) => {
  const pythonCode = `from jigsawstack import JigsawStack

jigsaw = JigsawStack(api_key="your-api-key")

response = jigsaw.${api.sdk_key_string}(${JSON.stringify(
    {
      ...api?.body,
      ...api?.query,
    },
    null,
    6
  )})`;

  return pythonCode;
};

const gen = async () => {
  fs.rmSync("./snippets/code-req-examples", { recursive: true, force: true });
  fs.mkdirSync("./snippets/code-req-examples");
  const apiKeys = Object.keys(APISchemas);

  const promises = apiKeys.map(async (apiKey) => {
    try {
      const api = APISchemas[apiKey];
      const JSSDKCode = getSDKJSCode(api);
      const pythonCode = getSDKPythonCode(api);
      const curlCode = CurlGenerator({
        url: `${url}${api.path}${api.query ? `?${new URLSearchParams(api.query).toString()}` : ""}`,
        method: api.method as any,
        headers: {
          ...api.headers,
          "Content-Type": "application/json",
          "x-api-key": "your-api-key",
        },
        body: api.body,
      });

      const phpCode = curlconverter.toPhp(curlCode);
      const rubyCode = curlconverter.toRuby(curlCode);
      const goCode = curlconverter.toGo(curlCode);
      const javaCode = curlconverter.toJava(curlCode);
      const swiftCode = curlconverter.toSwift(curlCode);
      const dartCode = curlconverter.toDart(curlCode);
      const kotlinCode = curlconverter.toKotlin(curlCode);
      const csharpCode = curlconverter.toCSharp(curlCode);

      let responseBody = null;

      if (!api.skip_request) {
        const response = await fetch(`${url}${api.path}${api.query ? `?${new URLSearchParams(api.query).toString()}` : ""}`, {
          method: api.method,
          headers: {
            ...api.headers,
            "Content-Type": "application/json",
            "x-api-key": process.env.JIGSAWSTACK_API_KEY!,
          },
          body: api.body ? JSON.stringify(api.body) : undefined,
        });

        if (!response.ok) {
          console.error(`${apiKey}: failed to generate response example`, response.status);
          return;
        }

        console.log(apiKey, response.headers.get("content-type"));

        responseBody = response.headers.get("content-type")?.includes("application/json") ? await response.json() : null;
      }

      const doc = `
    <RequestExample>
    \`\`\`javascript Javascript
${JSSDKCode}
    \`\`\`
    \`\`\`python Python
${pythonCode}
    \`\`\`
    \`\`\`bash Curl
${curlCode}
    \`\`\`
    \`\`\`php PHP
${phpCode}
    \`\`\`
    \`\`\`ruby Ruby
${rubyCode}
    \`\`\`
    \`\`\`go Go
${goCode}
    \`\`\`
    \`\`\`java Java
${javaCode}
    \`\`\`
    \`\`\`swift Swift
${swiftCode}
    \`\`\`
    \`\`\`dart Dart
${dartCode}
    \`\`\`
    \`\`\`kotlin Kotlin
${kotlinCode}
    \`\`\`
    \`\`\`csharp C#
${csharpCode}
    \`\`\`
    </RequestExample>
    ${
      responseBody
        ? `<ResponseExample>
    \`\`\`json Response
${JSON.stringify(responseBody, null, 6)}
    \`\`\`
    </ResponseExample>
    `
        : "\n\n<ResponseExample></ResponseExample>"
    }
    `;

      fs.writeFileSync(`./snippets/code-req-examples/${apiKey}.mdx`, doc);
    } catch (error) {
      console.error(`${apiKey}: failed to generate response example`, error);
    }
  });

  await Promise.all(promises);

  console.log("done");
};

gen();
