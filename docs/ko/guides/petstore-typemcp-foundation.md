# Petstore TypeMCP 기반: 선언, 확인, 컴파일, stdio 실행

이 장은 [Petstore 프로젝트 설정](petstore-project-setup.md)에서 이어집니다. 애플리케이션이 소유한 Petstore 클라이언트 이음새를 데코레이터가 적용된 MCP 서버 하나로 바꾸고, 정의를 검증하고, 명시적 리졸버로 컴파일한 뒤, 로컬 stdio 프로세스를 시작합니다.

## 시작하기 전에

- 엄격한 NodeNext TypeScript 설정을 포함해 [Petstore 프로젝트 설정](petstore-project-setup.md)을 마치세요.
- Node.js 20 이상, 그리고 릴리스된 `@theorvane/type-mcp@0.3.0`와 `zod` 의존성.
- 프로젝트를 로컬에서 확인한 뒤 stdio 프로세스에 연결할 계획이라면, 그때만 MCP를 지원하는 로컬 클라이언트가 필요합니다.

## 워크스페이스 체크포인트

이 장을 마치면 워크스페이스에는 다음이 포함됩니다.

```text
petstore-workspace/
└── src/
    ├── inspect-server.ts
    ├── petstore-client.ts
    ├── petstore-server.ts
    ├── server.ts
    └── run-stdio.ts
```

로컬 스크립트는 컴파일된 서버를 stdio에 연결합니다. 프로그램을 데스크톱 클라이언트에 등록하지 않고, 튜토리얼의 인메모리 카탈로그를 프로덕션 서비스로 만들지도 않습니다.

## 설치

프로젝트에 릴리스된 패키지와 로컬 명령이 있는지 확인합니다.

```bash
npm install @theorvane/type-mcp@0.3.0 zod
npm install --save-dev typescript tsx @types/node
npm pkg set scripts.check="tsc --noEmit"
npm pkg set scripts.inspect-server="tsx src/inspect-server.ts"
npm pkg set scripts.stdio="tsx src/run-stdio.ts"
```

## 서버 선언

`src/petstore-server.ts`를 만듭니다.

```ts
import { z } from "zod";
import { McpServer, McpTool } from "@theorvane/type-mcp";

import type { PetstoreClient } from "./petstore-client.js";

@McpServer({ name: "petstore", version: "1.0.0" })
export class PetstoreServer {
  @McpTool({
    name: "find-product",
    description: "Find a Petstore product by SKU.",
    input: z.object({ sku: z.string().min(1) }),
  })
  findProduct({ sku }: { readonly sku: string }) {
    if (this.client === undefined) {
      throw new Error("Petstore client was not configured by the application.");
    }

    return this.client.findProduct(sku);
  }

  private client: PetstoreClient | undefined;

  configure(client: PetstoreClient) {
    this.client = client;
    return this;
  }
}
```

데코레이터가 적용된 클래스에 생성자 매개변수가 없는 것은 의도된 것입니다. `0.3.0`에 배포된 `@McpServer` 데코레이터 계약이 그렇게 정의되어 있습니다. 명시적 리졸버가 컴파일 전에 애플리케이션이 소유한, 구성이 끝난 인스턴스를 반환합니다. `configure()`는 여러분의 컴포지션 루트 배선으로 바꾸되, 데코레이터가 적용된 생성자는 인자 없는 형태로 유지하세요.

## 선언 확인

`src/inspect-server.ts`를 만듭니다.

```ts
import { getMcpServerDefinition } from "@theorvane/type-mcp";

import { PetstoreServer } from "./petstore-server.js";

const definition = getMcpServerDefinition(PetstoreServer);
if (definition === undefined) {
  throw new Error("PetstoreServer is missing @McpServer metadata.");
}

console.log({
  server: definition.name,
  tools: definition.tools.map((tool) => tool.name),
});
```

`getMcpServerDefinition()`은 애플리케이션이 확인할 수 있도록 선언을 제공합니다. 서버를 인스턴스화하거나 전송을 열지는 않습니다.

## 명시적 리졸버로 컴파일

`src/server.ts`를 만듭니다.

```ts
import {
  createMcpServer,
  type InstanceResolver,
} from "@theorvane/type-mcp";

import type { PetstoreClient } from "./petstore-client.js";
import { PetstoreServer } from "./petstore-server.js";

export function createPetstoreMcpServer(petstoreClient: PetstoreClient) {
  const resolver: InstanceResolver<PetstoreServer> = {
    resolve: () => new PetstoreServer().configure(petstoreClient),
  };

  return createMcpServer(PetstoreServer, resolver);
}
```

명시적 형태인 `createMcpServer(PetstoreServer, resolver)`는 선언된 정의를 검증하고, 애플리케이션이 소유한 인스턴스를 해석한 뒤, 지원되는 표면을 MCP SDK 서버로 컴파일합니다.

규모가 큰 애플리케이션에서는 팩토리를 호출하기 전에 컴포지션 루트가 자신의 소유권을 명시할 수 있습니다.

```ts
import type { PetstoreClient } from "./petstore-client.js";

declare const petstoreClient: PetstoreClient;
```

이 선언은 타이핑 이음새이며 자격 증명 구현이 아닙니다. 실제 의존성은 애플리케이션 시작 코드에서 생성하고 인가하세요.

## 실행과 확인

`src/run-stdio.ts`를 만듭니다.

```ts
import { startStdioServer } from "@theorvane/type-mcp";

import type { PetstoreClient } from "./petstore-client.js";
import { createPetstoreMcpServer } from "./server.js";

const localPetstoreClient: PetstoreClient = {
  findProduct: async (sku) => ({
    sku,
    name: "Petstore starter product",
    available: true,
  }),
};

const server = await createPetstoreMcpServer(localPetstoreClient);
await startStdioServer(server);
```

그다음 실행합니다.

```bash
npm run check
npm run inspect-server
npm run stdio
```

마지막 명령은 stdio 전송이 MCP 프로토콜 메시지를 기다리는 동안 의도적으로 계속 실행됩니다. 프로세스가 시작되는 것을 확인한 뒤 `Ctrl+C`로 중지하세요. MCP를 지원하는 클라이언트는 애플리케이션이 패키징한 실행 명령으로 별도로 설정하세요. 그 클라이언트 설정은 TypeMCP가 만들어 주지 않습니다.

## 예상 동작

- `npm run check`가 성공합니다.
- `npm run inspect-server`가 다음과 동등한 값을 출력합니다.

  ```text
  { server: 'petstore', tools: [ 'find-product' ] }
  ```

- `npm run stdio`는 HTTP 리스너, 브라우저, 모델 호출, 자격 증명 없이 애플리케이션이 소유한 로컬 프로세스를 시작합니다. 연결된 MCP 클라이언트는 자신의 설정에 따라 컴파일된 `find-product` 도구를 발견할 수 있습니다.

## 실패 가이드

- **`PetstoreServer is missing @McpServer metadata`:** 클래스에 데코레이터가 적용되어 있는지, 확인 파일에서 `.js` ESM 경로로 임포트했는지 확인하세요.
- **데코레이터 관련 TypeScript 오류:** [프로젝트 설정](petstore-project-setup.md)의 NodeNext/`ESNext.Decorators` 설정을 사용하고, `experimentalDecorators`는 켜지 마세요.
- **데코레이터가 적용된 생성자가 호환되지 않는다는 TypeScript 오류:** `@McpServer` 클래스를 인자 없는 형태로 유지하고, 애플리케이션 의존성은 명시적 리졸버에서 구성하세요. 배포된 0.3.0 데코레이터 계약은 생성자 매개변수를 받는 클래스를 허용하지 않습니다.
- **프로세스가 즉시 종료됨:** 애플리케이션 시작 오류와 실제 클라이언트/의존성 설정을 확인하세요. `startStdioServer()`는 이미 컴파일된 서버를 연결할 뿐, 환경을 검증하거나 클라이언트를 준비해 주지는 않습니다.
- **로컬 MCP 클라이언트가 도구를 발견하지 못함:** 클라이언트가 프로젝트 디렉터리에서 문서화된 실행 파일을 실행하는지, 그리고 클라이언트 자신의 프로세스/접근 정책이 이를 허용하는지 확인하세요. TypeMCP는 데스크톱 클라이언트 설정을 등록하지 않습니다.

## 책임 경계

TypeMCP는 선언을 검증하고, MCP 서버를 컴파일하고, 그 서버를 stdio에 연결합니다. Petstore 데이터 접근, 리졸버 의존성, 프로세스 수명주기, 실행 파일 패키징, 환경 검증, 인가, 로깅 정책, 호스팅, 영속화, 모델, LangGraph 구성, 배포는 사용자가 소유합니다.

## 다음 단계

선택적인 Fetch/Next.js HTTP 또는 도구 전용 LangChain 재사용은 [Petstore 런타임 선택](petstore-walkthrough.md)으로 이어가세요. 전체 경계 표는 [런타임 선택](../../guides/runtime-selection.md), 정확한 공개 계약은 [데코레이터 API](../../api/decorator-api.md)에서 읽으세요.
