# `@theorvane/type-mcp@0.3.0` 시작하기

이 가이드는 배포된 `@theorvane/type-mcp@0.3.0` 패키지로 MCP **선언(declaration)** 을 만들고 확인합니다. 또한 `createMcpServer()`를 통해 데코레이터로 선언된 정의를 검증하고 컴파일합니다. 각 어댑터 경계는 [HTTP 가이드](../../guides/http-and-nextjs.md)와 [LangChain 가이드](../../guides/langchain-langgraph.md)에서 따로 다룹니다.

## 패키지 설치와 TypeScript 설정

패키지를 설치하고, 스키마를 소유하는 애플리케이션에서 Zod를 직접 임포트합니다.

```bash
npm install @theorvane/type-mcp@0.3.0 zod
```

Node.js 20 이상에서 실행합니다. 표준 TypeScript 데코레이터와 Node를 인식하는 ESM 설정을 사용하세요. 최소 `tsconfig.json`은 다음과 같습니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators"],
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

이 예제들은 현재의 표준 데코레이터 제안을 사용합니다. 여기에 레거시 `experimentalDecorators`를 켜지 마세요. 프로젝트가 CommonJS이거나 이미 다른 데코레이터 프레임워크를 쓰고 있다면 [설정과 호환성](../../guides/configuration.md)을 참고하세요.

## 서버 클래스 하나 선언하기

선언은 그것이 설명하는 애플리케이션 기능 옆에 두세요. `@McpServer`는 클래스를 장식하고, `@McpTool`·`@McpResource`·`@McpPrompt`는 인스턴스 메서드를 장식합니다.

```ts
// src/notes-server.ts
import { z } from "zod";
import {
  McpPrompt,
  McpResource,
  McpServer,
  McpTool,
} from "@theorvane/type-mcp";

@McpServer({ name: "notes", version: "0.2.0" })
export class NotesServer {
  @McpTool({
    name: "find-note",
    description: "Describe the note lookup operation.",
    input: z.object({ id: z.string().min(1) }),
  })
  findNote({ id }: { id: string }) {
    return { id, title: "Example note" };
  }

  @McpResource({
    name: "notes-config",
    uri: "config://notes",
    mimeType: "application/json",
  })
  readConfig() {
    return { locale: "en" };
  }

  @McpPrompt({
    name: "summarize-note",
    description: "Describe a note-summary prompt.",
  })
  summarizeNote() {
    return "Summarize the supplied note in three bullets.";
  }
}
```

`name`을 생략하면 공개 컴포넌트 이름은 메서드 이름을 기본값으로 씁니다. TypeMCP는 이 옵션들을 메타데이터로 기록하고, `0.3.0`는 컴파일 전에 선언된 정의를 검증합니다. 도메인에 특화된 이름 규칙은 애플리케이션 테스트로 확인하세요.

## 애플리케이션 경계에서 메타데이터 확인하기

`getMcpServerDefinition()`을 호출해 데코레이터가 적용된 클래스에 연결된 선언을 가져옵니다.

```ts
// src/inspect-notes-server.ts
import { getMcpServerDefinition } from "@theorvane/type-mcp";
import { NotesServer } from "./notes-server.js";

const definition = getMcpServerDefinition(NotesServer);

if (definition === undefined) {
  throw new Error("NotesServer is missing @McpServer metadata.");
}

console.log({
  server: definition.name,
  tools: definition.tools.map((tool) => tool.name),
  resources: definition.resources.map((resource) => resource.uri),
  prompts: definition.prompts.map((prompt) => prompt.name),
});
```

`@McpServer`가 없는 클래스에는 `undefined`를 반환합니다. 데코레이터가 적용된 클래스에는 새로 할당된 동결(frozen) 컨테이너를 반환합니다. 실행 가능한 스키마는 안전하게 복제하거나 동결할 수 없으므로, 도구 입력 스키마는 원래의 Zod 객체 동일성을 유지합니다. `@McpTool`에 전달한 뒤에는 스키마를 변경하지 마세요.

## 런타임 경계로 이어가기

배포된 `@theorvane/type-mcp@0.3.0` 패키지에는 `createMcpServer()`, `startStdioServer()`, `@theorvane/type-mcp/http`, `@theorvane/type-mcp/langchain`이 들어 있습니다. TypeMCP는 명시적인 `InstanceResolver`를 통해 선언된 정의를 검증하고 컴파일합니다. 웹 호스트, 인가 모델, 세션 저장소, LangGraph 토폴로지, 모델, 영속화 정책을 애플리케이션 대신 고르지는 않습니다.

위에서 만든 선언은 애플리케이션이 소유하는 확인 작업에 계속 유용합니다. 정의/컴파일러 모델은 [핵심 개념](core-concepts.md)에서 읽고, 그다음 [Petstore 워크스루](petstore-walkthrough.md)를 따라 stdio·HTTP·LangChain 중 무엇을 재사용할지 고르세요. 변경을 자동화하기 전에 [설정 가이드](../../guides/configuration.md), [HTTP 가이드](../../guides/http-and-nextjs.md), [LangChain 가이드](../../guides/langchain-langgraph.md), [에이전트 가이드](../../guides/agent-integration.md)를 확인하세요.
