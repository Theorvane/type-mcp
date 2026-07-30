# Petstore 워크스루: 선언에서 선택된 런타임까지

이 워크스루는 읽기 전용 Petstore 카탈로그 도구 하나로 배포된 [`@theorvane/type-mcp@0.2.2`](https://www.npmjs.com/package/@theorvane/type-mcp)의 흐름을 보여 줍니다. 서버를 선언하고, 확인하거나 컴파일한 뒤, 지원되는 가장 작은 런타임 경계를 고릅니다.

> **이것이 하지 않는 일:** TypeMCP는 호스팅, 인가, 영속화, 모델, LangGraph 구성, 배포를 고르지 않습니다. 그 결정은 애플리케이션에 남습니다.

## 시작하기 전에

- Node.js 20 이상
- 표준 데코레이터를 쓰는 TypeScript. 레거시 `experimentalDecorators`는 켜지 마세요
- 실제 도구가 데이터나 API 클라이언트를 필요로 한다면, 애플리케이션이 소유하는 카탈로그 서비스

## 워크스페이스 체크포인트

프로젝트를 처음부터 시작하는 경로라면 [Petstore 프로젝트 설정](petstore-project-setup.md)과 [Petstore TypeMCP 기반](petstore-typemcp-foundation.md)을 먼저 마치세요. 이 워크스루는 선언, 명시적 리졸버, 로컬 stdio 경로가 이미 컴파일되는 상태에서 런타임 경계 하나를 고르는 후속 단계입니다.

## 설치

패키지와 Zod를 설치합니다.

```bash
npm install @theorvane/type-mcp@0.2.2 zod
```

Node를 인식하는 TypeScript 설정을 사용합니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators", "DOM", "DOM.Iterable"],
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

## 1. Petstore 서버 선언

`src/petstore-server.ts`를 만듭니다.

```ts
import { z } from "zod";
import { McpServer, McpTool } from "@theorvane/type-mcp";

@McpServer({ name: "petstore", version: "1.0.0" })
export class PetstoreServer {
  @McpTool({
    name: "find-product",
    description: "Find a Petstore product by SKU.",
    input: z.object({ sku: z.string().min(1) }),
  })
  findProduct({ sku }: { readonly sku: string }) {
    return { sku, available: true };
  }
}
```

배포된 `0.2.2`의 `@McpServer` 계약에서는 데코레이터가 적용된 클래스가 인자 없는 생성자를 유지해야 합니다. 실제 카탈로그 서비스는 리졸버가 `PetstoreServer`를 생성하기 전에 명시적 리졸버를 통해 구성하세요. TypeMCP는 그 의존성을 대신 생성하거나 인가하지 않습니다.

## 2. 확인한 뒤 명시적 리졸버로 컴파일

`src/server.ts`를 만듭니다.

```ts
import {
  createMcpServer,
  getMcpServerDefinition,
  type InstanceResolver,
} from "@theorvane/type-mcp";
import { PetstoreServer } from "./petstore-server.js";

const definition = getMcpServerDefinition(PetstoreServer);
if (definition === undefined) {
  throw new Error("PetstoreServer is missing its declaration.");
}

const resolver: InstanceResolver<PetstoreServer> = {
  resolve: () => new PetstoreServer(),
};

export const server = await createMcpServer(PetstoreServer, resolver);
```

이 시점에서 TypeMCP는 선언을 검증하고, 애플리케이션 인스턴스 하나를 해석하고, MCP SDK 서버를 컴파일했습니다. 요청이 그 서버에 어떻게 도달하는지와 각 호출에 어떤 정책을 적용할지는 여전히 애플리케이션이 결정합니다.

## 3. 경계 하나 고르기

### stdio로 로컬 실행

MCP를 지원하는 데스크톱 또는 로컬 클라이언트가 여러분의 프로세스를 실행한다면 `src/stdio.ts`를 추가합니다.

```ts
import { startStdioServer } from "@theorvane/type-mcp";
import { server } from "./server.js";

await startStdioServer(server);
```

TypeMCP는 컴파일된 서버를 SDK stdio 전송에 연결합니다. 실행 파일 패키징, 환경 검증, 프로세스 수명주기, 접근 제어는 애플리케이션이 소유합니다. [런타임 선택](../../guides/runtime-selection.md#connect-stdio-when-the-process-is-the-boundary)으로 이어가세요.

### Fetch 또는 Next.js 호스트에서 Streamable HTTP 제공

추가 TypeMCP 패키지를 설치할 필요 없이, 배포된 HTTP 하위 경로를 임포트합니다. `src/mcp-handler.ts`를 만듭니다.

```ts
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";
import { PetstoreServer } from "./petstore-server.js";

export const handler = createMcpHandler(() =>
  createMcpServer(PetstoreServer, { resolve: () => new PetstoreServer() }),
);
```

Fetch 호스트는 `handler(request)`를 호출할 수 있습니다. Next.js 라우트에서는 `GET`, `POST`, `DELETE`로 다시 내보내세요. 어댑터는 JSON-RPC 프레이밍, 프로토콜 협상, 인프로세스 MCP 세션 라우팅을 소유합니다. 호스트는 URL, 인증, origin 제어, 지속 세션 정책, 텔레메트리, 배포를 소유합니다. [HTTP 프레임워크 통합](../../guides/http-and-nextjs.md)과 [실행 가능한 독립형 HTTP 예제](../../../examples/standalone-http/README.md)를 참고하세요.

### LangChain에서 도구 재사용

이 경로를 고를 때에만 선택적 피어 의존성을 설치합니다.

```bash
npm install @theorvane/type-mcp@0.2.2 @langchain/core zod
```

`src/langchain-tools.ts`를 만듭니다.

```ts
import { createLangChainTools } from "@theorvane/type-mcp/langchain";
import { PetstoreServer } from "./petstore-server.js";

export const tools = await createLangChainTools(PetstoreServer, {
  resolver: { resolve: () => new PetstoreServer() },
});
```

어댑터는 데코레이터가 적용된 `@McpTool` 메서드로 LangChain structured tools를 만듭니다. MCP 전송을 시작하거나, 에이전트를 만들거나, 모델을 고르거나, LangGraph 그래프를 만들지는 않습니다. `tools`를 여러분의 LangChain 또는 LangGraph 구성에 넘기고, 정책/상태 결정은 그쪽에 남겨 두세요. [LangChain과 LangGraph 통합](../../guides/langchain-langgraph.md)과 [인메모리 ToolNode 예제](../../../examples/langgraph-tools/README.md)를 참고하세요.

## 실행과 확인

후속 경로를 정확히 하나만 고르고, 프로젝트 루트에서 그에 맞는 검사를 실행하세요.

```bash
# stdio: 먼저 컴파일한 뒤 프로세스를 시작합니다. stdin/stdout에 계속 붙어 있습니다.
npm run check
npm run inspect-server
npm run stdio

# HTTP: 위와 같이 src/mcp-handler.ts를 만든 뒤 소비자 프로젝트를 컴파일합니다.
npm run check

# LangChain: 위와 같이 src/langchain-tools.ts를 만든 뒤 소비자 프로젝트를 컴파일합니다.
npm run check
```

`npm run check`는 소비자 프로젝트 검증입니다. 선택한 각 소스 파일을 설치된 배포 패키지에 대해 타입 검사합니다. stdio의 경우 성공한 프로세스는 완료 줄을 출력하는 대신 MCP 클라이언트를 위해 열린 상태로 남습니다. 클라이언트가 연결된 뒤 `Ctrl+C`로 중지하세요. HTTP와 LangChain 컴파일은 리스너를 배포하거나 모델을 호출하지 않습니다.

## 예상 동작

선언은 공개 도구 이름 `find-product`를 만듭니다. 선택한 stdio 경로는 이미 컴파일된 서버를 로컬 프로세스에 연결하고, HTTP 경로는 Fetch 호환 핸들러를 반환하며, LangChain 경로는 structured tools를 반환합니다. 이 선택들 중 어느 것도 호스트를 만들거나, 호출자를 인가하거나, 모델을 고르거나, 애플리케이션 상태를 영속화하지 않습니다.

## 패턴 검증

**저장소 관리자 전용:** 아래 명령은 이 저장소 체크아웃이 필요합니다(복사한 소비자 워크스페이스용 명령이 아닙니다). 실제 리스너, 모델, 자격 증명, 공개 Petstore 요청 없이 배포된 HTTP와 LangChain 경계를 증명합니다.

```bash
npm test -- --run test/standalone-http-example.test.ts
npm test -- --run test/langgraph-tool-node.test.ts
```

이 스모크 테스트는 기존 카탈로그 예제를 실행합니다. 여러분의 애플리케이션에서는 리졸버, 도구의 도메인 결과, 그리고 TypeMCP가 의도적으로 남겨 둔 인가 정책에 대한 집중된 테스트를 추가하세요.

## 실패 가이드

- **데코레이터 또는 ESM 컴파일 실패:** [프로젝트 설정](petstore-project-setup.md)의 엄격한 `NodeNext`와 `ESNext.Decorators` 설정으로 시작하세요. 레거시 `experimentalDecorators`는 켜지 마세요.
- **의존성이나 자격 증명을 쓸 수 없음:** 리졸버가 `PetstoreServer`를 생성하기 전에 애플리케이션 컴포지션 루트에서 생성하고 검증하세요. TypeMCP는 자격 증명이나 재시도 정책을 공급하지 않습니다.
- **클라이언트가 다른 프로세스를 필요로 함:** 애플리케이션이 고른 stdio 또는 HTTP 호스트를 사용하세요. LangChain 경로는 도구만 적응시키며 클라이언트/전송이 아닙니다.

## 책임 경계

TypeMCP는 선언을 검증하고, 리졸버를 통해 컴파일하고, 컴파일된 서버를 선택된 배포 경계에 연결할 수 있습니다. 카탈로그 클라이언트, 인가, 정책, 프로세스와 호스트 수명주기, 영속화, 모델, LangGraph 구성, 텔레메트리, 배포는 애플리케이션이 소유합니다.

## 다음 단계

- [핵심 개념](core-concepts.md) — 선언, 정의, 컴파일러, 리졸버 모델.
- [런타임 경계 고르기](../../guides/runtime-selection.md) — 루트, stdio, HTTP, LangChain 결정 표.
- [데코레이터 API 계약](../../api/decorator-api.md) — 정확한 공개 API와 제외 항목.
