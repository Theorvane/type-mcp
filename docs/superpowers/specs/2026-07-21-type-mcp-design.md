# type-mcp 설계 명세

**상태:** 역사적 설계 기록 — package layout은 대체됨
**작성일:** 2026-07-21

> **대체 안내:** 이 문서의 두 npm workspace (`@type-mcp/core`, `@type-mcp/http`) 구조는 더 이상 현재 계약이 아닙니다. 승인된 현재 구조는 단일 unscoped `type-mcp` package와 `type-mcp/http` subpath입니다. 실행 단위 작업은 [single-package migration plan](../../planning/2026-07-21-single-package-migration.md), 정식 문서 진입점은 [docs/README.md](../../README.md)를 따릅니다. 아래 내용은 설계 이력으로만 보존됩니다.

## 1. 목표

`type-mcp`는 TypeScript에서 MCP(Model Context Protocol) 서버를 데코레이터 기반으로 작성하도록 지원하는 프레임워크다. FastMCP의 선언적 컴포넌트 등록 경험과 `mcp-handler`의 Web/Next.js 전송 어댑터 모델을 참고한다.

초기 목표는 다음과 같다.

- 클래스·메서드 데코레이터로 MCP server, tool, resource, prompt를 선언한다.
- 공식 `@modelcontextprotocol/sdk`의 `McpServer`를 생성하고 등록 정보를 컴파일한다.
- Fetch 표준 `Request`/`Response` 기반 Streamable HTTP 핸들러를 제공한다.
- NestJS에 직접 의존하지 않되, Nest DI와 탐색 기능을 연결할 수 있는 안정적 확장 지점을 제공한다.
- strict TypeScript, 런타임 입력 검증, 테스트 및 CI가 갖춰진 라이브러리를 제공한다.

비목표(첫 릴리스): NestJS 모듈 구현, OAuth/인증 제품화, SSE 레거시 전송, 리소스 템플릿, 프로덕션 세션 저장소, 멀티 서버 라우팅이다.

## 2. 모노레포 구조

```text
packages/
  core/                         # public package: @type-mcp/core
    src/
      decorators/               # @McpServer, @McpTool, @McpResource, @McpPrompt
      metadata/                 # Reflect metadata keys, definition readers
      compiler/                 # definition -> MCP SDK server registrations
      resolver/                 # InstanceResolver abstraction + default resolver
      transports/               # stdio startup helper
  http/                         # public package: @type-mcp/http
    src/                        # Fetch Request -> Response Streamable HTTP adapter
examples/
  standalone-http/
  nextjs/
docs/
.github/workflows/
```

패키지는 npm workspace로 관리하고 `tsup`으로 ESM, CJS, 선언 파일을 생성한다.

## 3. 공용 API

```ts
import { z } from "zod";
import {
  McpServer,
  McpTool,
  McpResource,
  McpPrompt,
  createMcpServer,
} from "@type-mcp/core";

@McpServer({ name: "weather", version: "0.1.0" })
class WeatherServer {
  @McpTool({
    description: "두 숫자의 합계를 계산합니다.",
    input: z.object({ a: z.number(), b: z.number() }),
  })
  add({ a, b }: { a: number; b: number }) {
    return { content: [{ type: "text", text: String(a + b) }] };
  }

  @McpResource({ uri: "config://app", mimeType: "application/json" })
  config() {
    return { version: "0.1.0" };
  }

  @McpPrompt({ description: "사용자에게 인사하는 프롬프트" })
  greet(name: string) {
    return `안녕하세요, ${name}님!`;
  }
}

const server = createMcpServer(WeatherServer);
```

`@type-mcp/http`는 다음 Fetch 표준 핸들러를 제공한다.

```ts
import { createMcpHandler } from "@type-mcp/http";

const handler = createMcpHandler(server);
export { handler as GET, handler as POST, handler as DELETE };
```

## 4. 아키텍처

### 4.1 정의와 컴파일 분리

데코레이터는 대상 클래스 및 메서드에 불변 `ServerDefinition`, `ToolDefinition`, `ResourceDefinition`, `PromptDefinition`만 기록한다. 도메인 로직을 실행하거나 MCP SDK에 직접 등록하지 않는다.

`createMcpServer()`는 정의를 읽고, `InstanceResolver`로 인스턴스를 확보한 후, 공식 SDK의 `McpServer`에 등록한다. 이 분리는 테스트 가능성과 프레임워크 독립성을 확보한다.

### 4.2 인스턴스 생명주기

```ts
export interface InstanceResolver {
  resolve<T>(serverClass: new (...args: never[]) => T): T | Promise<T>;
}
```

기본 resolver는 매 서버 생성 시 클래스를 직접 생성한다. 이후 `@type-mcp/nestjs`는 Nest `ModuleRef`를 사용해 동일 인터페이스를 구현한다. 따라서 요청 범위 provider, 의존성 주입, discovery는 Nest 어댑터의 책임이며 core의 의존성이 아니다.

### 4.3 도구 실행 및 오류

- 도구 입력은 `zod` 스키마로 런타임 검증한다.
- 유효하지 않은 입력은 MCP 오류 응답으로 변환한다.
- 동기 및 `Promise` 반환 메서드를 모두 지원한다.
- 등록된 메서드에서 발생한 예외는 내부 오류로 변환하고 원문 stack trace를 클라이언트에 노출하지 않는다.
- 정의 오류(중복 tool 이름, `@McpServer` 누락, 불완전한 옵션)는 서버 생성 시 fail-fast 한다.

### 4.4 전송

`@type-mcp/http`는 SDK의 `WebStandardStreamableHTTPServerTransport`로 요청을 처리한다.

- 표준 Fetch `Request`를 받아 `Promise<Response>`를 반환한다.
- `GET`, `POST`, `DELETE` 메서드를 지원한다.
- SDK가 관리하는 MCP 세션과 JSON-RPC 요청 처리를 보존한다.
- Next.js Route Handler는 래퍼 없이 그대로 export할 수 있다.

Core의 stdio helper는 단일 compiled server를 SDK stdio transport에 연결한다.

## 5. NestJS 확장 설계

첫 릴리스에는 NestJS 의존성을 추가하지 않는다. 후속 `@type-mcp/nestjs`는 다음을 제공한다.

- `TypeMcpModule.forRoot()` 및 `forRootAsync()`
- `DiscoveryService`로 `@McpServer` provider 발견
- Nest `ModuleRef` 기반 `InstanceResolver`
- controller/route에 연결 가능한 HTTP handler factory
- Nest provider scope를 보존하는 요청별 resolver 전략

Core의 decorator metadata schema와 resolver 인터페이스는 이 패키지의 호환성 계약이므로 semver로 관리한다.

## 6. 테스트 전략

Vitest로 test-first 개발한다.

1. server decorator가 서버 정의를 저장한다.
2. tool/resource/prompt decorator가 메서드 정의와 옵션을 저장한다.
3. compiler가 MCP SDK server에 선언을 등록하고 tool을 호출한다.
4. 동기와 비동기 메서드의 결과가 올바른 MCP content로 반환된다.
5. 잘못된 tool 입력과 handler 예외가 안전한 MCP 오류로 변환된다.
6. custom `InstanceResolver`가 사용된다.
7. HTTP handler가 initialize 및 tools/list/tools/call Streamable HTTP 요청을 처리한다.

각 동작은 실패하는 테스트를 먼저 실행한 뒤 최소 구현으로 통과시킨다.

## 7. 품질·배포 기준

- TypeScript `strict: true`, public API에서 `any` 금지
- `npm run typecheck`, `npm test`, `npm run build`가 모두 통과해야 한다.
- GitHub Actions는 Node LTS에서 위 세 검증을 실행한다.
- MIT License, README, 사용 예제를 포함한다.
- GitHub 저장소: `sjungwon03/type-mcp`, 비공개(private)

## 8. 구현 순서

1. workspace/tooling/CI 설정
2. core definition types와 decorators
3. metadata reader 및 resolver
4. compiler와 tool 실행 오류 경계
5. stdio helper
6. Fetch Streamable HTTP adapter
7. examples 및 README
8. 전체 검증, private GitHub repository 생성 및 push
