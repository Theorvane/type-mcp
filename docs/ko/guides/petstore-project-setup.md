# Petstore 프로젝트 설정: 엄격한 TypeScript 워크스페이스

TypeMCP Petstore 커리큘럼의 첫 장입니다. 애플리케이션이 런타임 경계를 고르기 전에, 데코레이터가 적용된 서버를 컴파일할 수 있는 작은 로컬 프로젝트를 만듭니다.

> **배포 버전:** 예제는 [`@theorvane/type-mcp@0.3.0`](https://www.npmjs.com/package/@theorvane/type-mcp)를 대상으로 합니다. 레거시 `experimentalDecorators`가 아니라 표준 TypeScript 데코레이터를 사용합니다.

## 시작하기 전에

- Node.js 20 이상과 npm.
- 새 프로젝트를 만들 수 있는 디렉터리의 터미널.
- 앞으로 애플리케이션이 소유할 Petstore 클라이언트 또는 서비스. 이 장에서는 의도적으로 자격 증명을 만들지 않고, API를 고르지 않으며, 네트워크 요청도 하지 않습니다.

## 워크스페이스 체크포인트

이 장을 마치면 워크스페이스는 다음 형태가 됩니다.

```text
petstore-workspace/
├── package.json
├── tsconfig.json
└── src/
    └── petstore-client.ts
```

프로젝트는 타입 검사를 통과합니다. 아직 MCP 서버를 노출하지는 않습니다. 그것은 다음 장입니다. `DOM`/`DOM.Iterable`은 배포된 MCP SDK의 Web API 타입을 커버하고, `@types/node`는 `console` 같은 로컬 Node 전역을 커버합니다.

## 설치

워크스페이스를 만들고, ESM으로 표시한 뒤, 릴리스된 패키지와 이 가이드에서 쓰는 도구를 설치합니다.

```bash
mkdir petstore-workspace
cd petstore-workspace
npm init -y
npm pkg set type=module
npm install @theorvane/type-mcp@0.3.0 zod
npm install --save-dev typescript tsx @types/node
npm pkg set scripts.check="tsc --noEmit"
```

`@theorvane/type-mcp`는 데코레이터, 정의 확인, 컴파일, stdio 헬퍼를 제공합니다. 도구 입력 스키마는 애플리케이션이 공급하므로 `zod`는 애플리케이션 의존성입니다. `tsx`는 뒤의 stdio 장에서 로컬 TypeScript 진입점을 실행하는 데 쓰이며, TypeMCP 런타임 요구사항은 아닙니다.

## TypeScript 설정

`tsconfig.json`을 만듭니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators", "DOM", "DOM.Iterable"],
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

`experimentalDecorators`는 켜지 **마세요**. 이 예제들은 현재의 표준 데코레이터 제안을 사용합니다. 기존 CommonJS 프로젝트나 다른 데코레이터 프레임워크에 이 설정을 적용하기 전에 [설정과 호환성](../../guides/configuration.md)을 확인하세요.

## 애플리케이션 이음새 만들기

`src/petstore-client.ts`를 만듭니다.

```ts
export interface PetstoreClient {
  findProduct(sku: string): Promise<{
    readonly sku: string;
    readonly name: string;
    readonly available: boolean;
  }>;
}
```

이 인터페이스는 의도적으로 애플리케이션 소유입니다. 실제 프로젝트에서는 그 구현이 데이터베이스, 도메인 서비스, 또는 자격 증명이 필요한 HTTP API를 호출할 수 있습니다. TypeMCP는 그 의존성을 고르지도, 생성하지도 않습니다.

## 실행과 확인

타입 검사를 실행합니다.

```bash
npm run check
```

## 예상 동작

TypeScript는 리스너, 네트워크 요청, 모델 호출, MCP 세션을 만들지 않고 정상 종료합니다. 이제 워크스페이스는 엄격한 ESM과 데코레이터 지원, 그리고 애플리케이션의 카탈로그 의존성을 위한 타입이 붙은 이음새를 갖췄습니다.

## 실패 가이드

- **`Cannot find name 'console'` 또는 Node 전역 오류:** 이 최소 구성 장에서는 Node 전역을 쓰지 않습니다. 애플리케이션 진입점이 Node API를 필요로 한다면, 데코레이터 설정을 바꾸지 말고 해당 애플리케이션에 적절한 Node 타입 설정을 추가하세요.
- **`Cannot use import statement outside a module`:** `package.json`에 `"type": "module"`이 있는지 확인하고, `module`과 `moduleResolution`을 `NodeNext`로 유지하세요.
- **다음 장을 복사한 뒤 데코레이터 오류:** 레거시 `experimentalDecorators`를 제거하세요. Stage 3 데코레이터 타이핑에는 이 가이드의 `ESNext.Decorators` 라이브러리 항목이 필요합니다.

## 책임 경계

워크스페이스, 패키지 매니저, 의존성 버전, 자격 증명, Petstore 클라이언트 구현, 프로젝트 수명주기는 사용자가 소유합니다. TypeMCP는 프로젝트를 만들지 않고, 배포를 설정하지 않으며, 엔드포인트를 호스팅하지 않고, 호출자를 인가하지 않으며, 상태를 영속화하지 않고, 모델을 고르지 않으며, Petstore 요청을 보내지 않습니다.

## 다음 단계

[Petstore TypeMCP 기반](petstore-typemcp-foundation.md)으로 이어가서 서버를 선언하고, 정의를 확인하고, 명시적 리졸버로 컴파일하고, 로컬 stdio 경계를 시작하세요.
