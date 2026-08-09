# 강의 운영 관리

강의별 기본 정보, 유튜브 출연, 랜딩페이지와 외부 자료를 통합 관리하는 내부 운영 서비스입니다. Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL로 구성되어 있습니다.

## 주요 기능

- 이메일/비밀번호 로그인과 대시보드/API 세션 보호
- 강의 생성·수정·삭제 및 반응형 Sidebar/Drawer
- 유튜브 출연, 랜딩페이지, 자료 공유 다중 CRUD
- 탭별 명시적 저장, Dirty State, 이동 전 저장 경고
- 서버 전용 6자리 Short Code 생성과 UNIQUE 충돌 재시도
- 현재 Browser Origin 기반 Short URL 표시·복사
- `/s/[shortCode]`의 302 리다이렉트와 잘못된 코드 404 처리
- Supabase RLS와 강의 삭제 시 연결 데이터 Cascade 삭제

## 로컬 실행

필수 조건은 Node.js 20 이상과 Supabase 프로젝트입니다.

1. `.env.example`을 `.env.local`로 복사하고 Supabase 값을 입력합니다.
2. Supabase SQL Editor에서 `supabase/migrations/20260809000000_initial_schema.sql`을 실행합니다.
3. Supabase Authentication의 Users 화면에서 운영자 이메일/비밀번호 계정을 생성합니다.
4. 의존성을 설치하고 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열고 생성한 운영자 계정으로 로그인합니다.

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`는 공개 Short URL 리다이렉트 서버에서만 사용됩니다. 브라우저 번들에 노출하지 마세요.

## 검증 명령

```bash
npm run lint
npm test
npm run build
```

## GitHub 및 Vercel 배포

1. 이 저장소를 GitHub에 Push합니다.
2. Vercel에서 저장소를 Import합니다.
3. Production, Preview, Development 환경에 위의 환경 변수 3개를 설정합니다.
4. `main` 브랜치를 Production 브랜치로 지정합니다.

짧은 주소는 DB에 전체 URL을 저장하지 않습니다. Vercel Production에서 복사하면 `https://<project>.vercel.app/s/<shortCode>`, Preview에서는 해당 Preview Origin을 자동 사용합니다.

## 구조

- `src/app/api`: PRD에 정의된 REST API
- `src/app/dashboard`: 인증된 강의 관리 화면
- `src/app/s/[shortCode]/route.ts`: 공개 302 리다이렉트
- `src/components/courses`: 탭별 편집·저장 UI
- `src/lib/supabase`: Browser/Server/Admin Supabase 클라이언트
- `supabase/migrations`: 스키마, 인덱스, RLS, updated_at Trigger
