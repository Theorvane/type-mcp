# 핵심 개념

이 문서는 런타임 경계를 고르기 전에 배포된 [`@theorvane/type-mcp@0.2.2`](https://www.npmjs.com/package/@theorvane/type-mcp) 모델을 설명합니다.

> **책임 경계:** TypeMCP는 선언 메타데이터, 검증, MCP SDK 컴파일, 그리고 선별된 어댑터를 제공합니다. **호스팅, 인가, 영속화, 모델, LangGraph 구성, 배포**의 소유권은 애플리케이션에 남습니다.

## 선언은 배포가 아니다

데코레이터는 평범한 애플리케이션 메서드에 MCP를 향한 계약을 기술합니다.

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

`@McpServer`는 서버 신원을 기록합니다. `@McpTool`은 공개 이름, 설명, Zod 객체 입력 스키마를 기록합니다. 리소스와 프롬프트 데코레이터도 각자 지원하는 정적 계약에 대해 같은 방식으로 동작합니다. 데코레이터는 프로세스를 시작하지 않고, 네트워크 리스너를 열지 않으며, 웹 프레임워크를 고르지 않고, 자격 증명을 읽지 않으며, 호출자를 인가하지 않습니다.

## 애플리케이션 경계에서 정의 읽기

애플리케이션 코드가 계약을 노출하기 전에 확인해야 할 때 `getMcpServerDefinition()`을 사용합니다.

```ts
import { getMcpServerDefinition } from "@theorvane/type-mcp";
import { PetstoreServer } from "./petstore-server.js";

const definition = getMcpServerDefinition(PetstoreServer);
if (definition === undefined) {
  throw new Error("PetstoreServer is missing @McpServer metadata.");
}

console.log(definition.tools.map((tool) => tool.name));
// ["find-product"]
```

반환된 정의 컨테이너, 컴포넌트 배열, 컴포넌트 레코드는 모두 동결된 스냅샷입니다. 실행 가능한 스키마는 안전하게 복제하거나 동결할 수 없으므로 도구의 Zod 스키마는 원래의 동일성을 유지합니다. 데코레이터에 넘긴 스키마는 불변으로 취급하세요.

## 명시적 인스턴스 리졸버로 컴파일하기

`createMcpServer()`는 선언된 정의를 검증하고, 인스턴스를 해석한 뒤, 공식 MCP SDK 서버를 만듭니다. 리졸버는 애플리케이션이 서비스·리포지토리·API 클라이언트를 공급할 수 있는 경계입니다.

```ts
import {
  createMcpServer,
  type InstanceResolver,
} from "@theorvane/type-mcp";
import { PetstoreServer } from "./petstore-server.js";

const resolver: InstanceResolver<PetstoreServer> = {
  resolve: () => new PetstoreServer(),
};

const server = await createMcpServer(PetstoreServer, resolver);
```

인자가 없는 클래스에는 기본 리졸버를 쓸 수 있습니다. 의존성이 필요한 클래스에는 명시적 `InstanceResolver`를 공급하세요. TypeMCP는 애플리케이션 컨테이너를 탐색하지 않고, 의존성을 대신 생성하지도 않습니다.

## 가장 작은 런타임 경계 고르기

| 필요한 것 | 배포된 진입점 | TypeMCP가 제공 | 애플리케이션이 제공 |
| --- | --- | --- | --- |
| 서버를 기술·확인·컴파일 | `@theorvane/type-mcp` | 선언, 검증, 리졸버 이음새, MCP SDK 컴파일 | 의존성, 메서드 동작, 인가 |
| 로컬 MCP 클라이언트와 통신 | `@theorvane/type-mcp` | `startStdioServer()` | 실행 파일 패키징, 프로세스 수명주기, 환경 검증, 접근 제어 |
| Fetch로 MCP 요청 수신 | `@theorvane/type-mcp/http` | Streamable HTTP 프레이밍과 인프로세스 세션 라우팅 | 라우트, origin 정책, 인증, 지속 세션 정책, 배포 |
| 선언된 도구를 LangChain에서 재사용 | `@theorvane/type-mcp/langchain` | LangChain structured tools | 모델, 에이전트/그래프 토폴로지, 상태, 정책, 영속화 |

각 경계의 전체 코드는 [런타임 경계 고르기](../../guides/runtime-selection.md)에서 읽으세요. [Petstore 워크스루](petstore-walkthrough.md)는 같은 선언으로 그 선택을 구체적으로 보여 줍니다.

## 다음에 읽을 것

- [Petstore 워크스루](petstore-walkthrough.md) — 선언, 리졸버, 그리고 지원되는 세 가지 경로.
- [데코레이터 API 계약](../../api/decorator-api.md) — 모든 공개 옵션과 제외 항목.
- [HTTP 프레임워크 통합](../../guides/http-and-nextjs.md) — Fetch/Next.js 라우트 형태.
- [LangChain과 LangGraph 통합](../../guides/langchain-langgraph.md) — 도구 전용 어댑터와 소비자가 소유하는 그래프 구성.
