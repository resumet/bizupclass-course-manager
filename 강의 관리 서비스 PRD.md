# 강의 관리 서비스 PRD

버전: 1.1.0  
작성일: 2026-08-09  
서비스 유형: 내부 강의 운영 관리 시스템  
개발 환경: Local Development  
배포: GitHub + Vercel  
Database: Supabase  
기본 배포 도메인: Vercel 기본 `*.vercel.app` 도메인

---

# 1. 프로젝트 개요

본 서비스는 강의 및 웨비나 운영에 필요한 정보를 하나의 시스템에서 통합 관리하기 위한 웹 기반 내부 관리 서비스다.

강의마다 다음 정보를 관리한다.

- 강의 기본 정보
- 유튜브 출연 정보
- 랜딩페이지
- 짧은 주소
- Google Drive / Notion 등 자료 공유 링크

전체 서비스의 중심 데이터는 **강의 Course**이며, 모든 부가 정보는 강의에 연결된다.

---

# 2. 핵심 목표

서비스의 핵심 목표는 다음과 같다.

1. 모든 강의를 하나의 대시보드에서 관리한다.
2. 왼쪽 Sidebar에서 강의를 선택한다.
3. 오른쪽 메인 화면에서 탭별로 정보를 관리한다.
4. 각 탭은 독립적인 저장 버튼을 가진다.
5. 데이터는 Supabase PostgreSQL에 저장한다.
6. 랜딩페이지 등록 시 자동으로 Short Code를 생성한다.
7. Short URL은 Vercel 기본 도메인을 사용한다.
8. 별도의 도메인 구매 없이 바로 사용할 수 있도록 한다.
9. 로컬 개발 후 GitHub를 통해 관리한다.
10. GitHub와 Vercel을 연동하여 자동 배포한다.

---

# 3. 기술 스택

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend / Database

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase RLS

## Deployment

- GitHub
- Vercel

---

# 4. 서비스 구조

전체 화면은 다음과 같이 구성한다.

```text
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│ 강의 목록       │             강의 관리                       │
│ Sidebar        │                                            │
│                │ [기본정보] [유튜브] [랜딩페이지] [자료공유]   │
│ + 강의 추가     │                                            │
│                │                                            │
│ 강의 A         │                                            │
│ 강의 B         │                                            │
│ 강의 C         │                                            │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

---

# 5. 강의 관리

왼쪽 Sidebar에는 등록된 모든 강의를 표시한다.

상단 버튼

```text
+ 새 강의 추가
```

강의 예시

```text
네이버 블로그 수익화
호텔 투자 클래스
부동산 투자 강의
AI 업무 자동화
```

강의를 클릭하면 해당 강의 관리 화면으로 이동한다.

URL 구조

```text
/dashboard/courses/{courseId}
```

---

# 6. 강의 추가

강의 추가 버튼 클릭 시 Modal을 표시한다.

입력 항목

- 강의명
- 강사명
- 웨비나 날짜
- 개강 날짜

강의명은 필수값이다.

버튼

```text
취소
강의 추가
```

저장 완료 후:

1. Supabase `courses` 테이블 저장
2. Sidebar에 강의 추가
3. 생성한 강의 상세 화면 이동

---

# 7. 강의 상세 화면

강의를 선택하면 오른쪽 영역에 다음 탭을 표시한다.

```text
기본 정보
유튜브 출연
랜딩페이지
자료 공유
```

각 탭은 독립적인 수정 상태를 가진다.

---

# 8. 저장 정책

자동저장은 사용하지 않는다.

사용자가 데이터를 수정하면 반드시 저장 버튼을 눌러야 한다.

변경사항이 없는 경우

```text
[저장]
disabled
```

변경사항이 있는 경우

```text
변경사항 있음
[저장]
```

저장 중

```text
저장 중...
```

저장 완료

```text
저장되었습니다.
```

Toast 표시.

---

# 9. 저장하지 않은 데이터 보호

저장하지 않은 상태에서 다음 행동을 하는 경우 경고한다.

- 다른 탭 이동
- 다른 강의 선택
- 페이지 이동

경고 Modal

```text
저장되지 않은 변경사항이 있습니다.

변경사항을 저장하지 않고 이동하시겠습니까?
```

버튼

```text
취소
저장하지 않고 이동
저장 후 이동
```

---

# 10. TAB 1 — 기본 정보

입력 항목

## 강의명

필수

예

```text
네이버 블로그 수익화 마스터 클래스
```

## 강사명

예

```text
최광자
```

## 웨비나 날짜

DateTime Picker

예

```text
2026-08-20 20:00
```

## 개강 날짜

Date Picker 또는 DateTime Picker

예

```text
2026-09-01
```

하단

```text
[저장]
```

---

# 11. TAB 2 — 유튜브 출연

한 강의에는 여러 개의 유튜브 출연 정보를 등록할 수 있다.

상단

```text
유튜브 출연

[+ 출연 추가]
```

---

# 12. 유튜브 출연 입력 항목

각 유튜브 출연 정보는 다음 필드를 가진다.

- 채널 이름
- 출연료
- RS
- 담당자 이름
- 담당자 전화번호
- 촬영 날짜
- 유튜브 주소

---

# 13. 채널 이름

예

```text
부읽남TV
김작가TV
월급쟁이부자들TV
```

필수값.

---

# 14. 출연료

숫자로 입력한다.

예

```text
3,000,000원
```

DB에는

```text
3000000
```

형태로 저장한다.

---

# 15. RS

Revenue Share 비율.

예

```text
20%
```

DB

```text
20
```

Validation

```text
0 ~ 100
```

---

# 16. 담당자

이름

```text
김민수
```

전화번호

```text
010-1234-5678
```

---

# 17. 촬영 날짜

DateTime Picker

예

```text
2026-08-15 14:00
```

---

# 18. 유튜브 주소

예

```text
https://youtube.com/watch?v=xxxxx
```

영상 업로드 전에는 비워둘 수 있다.

---

# 19. 유튜브 출연 목록

Table

| 채널 | 출연료 | RS | 담당자 | 촬영일 | YouTube |
|---|---:|---:|---|---|---|
| 부읽남TV | 3,000,000원 | 20% | 김민수 | 8/15 | 링크 |
| 김작가TV | 2,000,000원 | 15% | 이수진 | 8/18 | 링크 |

각 행에는

```text
수정
삭제
```

기능을 제공한다.

---

# 20. TAB 3 — 랜딩페이지 관리

한 강의에는 여러 개의 랜딩페이지를 등록할 수 있다.

예

```text
무료 웨비나
본 강의 판매페이지
얼리버드
유튜브 광고 A
유튜브 광고 B
```

---

# 21. 랜딩페이지 입력 항목

## 이름

예

```text
무료 웨비나 페이지
```

필수값.

## 원본 랜딩페이지 주소

예

```text
https://example.com/course/blog-master/webinar?utm_source=youtube
```

필수값.

## Short Code

자동 생성.

예

```text
aB39Kd
```

사용자가 직접 입력하지 않는다.

---

# 22. Short URL 핵심 설계

이 서비스에서는 별도의 커스텀 도메인을 사용하지 않는다.

Vercel 배포 시 자동으로 제공되는 기본 도메인을 사용한다.

예를 들어 프로젝트명이

```text
course-manager
```

라면 Production URL은 다음과 같은 형태가 될 수 있다.

```text
https://course-manager.vercel.app
```

Short URL은 다음 형태로 생성된다.

```text
https://course-manager.vercel.app/s/aB39Kd
```

---

# 23. Short URL DB 저장 정책

매우 중요한 원칙이다.

**전체 Short URL을 DB에 저장하지 않는다.**

잘못된 방식

```text
https://course-manager.vercel.app/s/aB39Kd
```

전체 문자열을 저장.

권장 방식

```text
aB39Kd
```

만 저장한다.

DB 필드

```text
short_code
```

---

# 24. Short URL 표시 방식

화면에서 짧은 주소를 보여줄 때 현재 사이트 Origin을 이용한다.

구조

```text
현재 Origin + /s/ + short_code
```

예

```text
window.location.origin
```

값이

```text
https://course-manager.vercel.app
```

인 경우

```text
https://course-manager.vercel.app/s/aB39Kd
```

를 표시한다.

---

# 25. 로컬 Short URL

로컬 개발 환경에서는 자동으로

```text
http://localhost:3000
```

을 사용한다.

예

```text
http://localhost:3000/s/aB39Kd
```

---

# 26. Production Short URL

Vercel Production에서는 자동으로 배포 도메인이 사용된다.

예

```text
https://course-manager.vercel.app/s/aB39Kd
```

---

# 27. 향후 커스텀 도메인 적용

향후 별도 도메인을 연결하더라도 DB 수정은 필요하지 않다.

현재

```text
https://course-manager.vercel.app/s/aB39Kd
```

향후

```text
https://go.example.com/s/aB39Kd
```

DB에는 계속

```text
aB39Kd
```

만 저장된다.

따라서 기존 Short Code를 그대로 사용할 수 있다.

---

# 28. Short Code 생성 규칙

길이

```text
6자리
```

문자

```text
A-Z
a-z
0-9
```

예

```text
aB39Kd
```

```text
X9cD21
```

```text
L2maQ8
```

---

# 29. Short Code 중복 방지

`landing_pages.short_code` 필드에 UNIQUE Constraint를 설정한다.

코드 생성 후 DB에서 중복이 발생하면 새로운 코드를 생성한다.

Pseudo Flow

```text
랜덤 코드 생성
       ↓
DB Insert
       ↓
Unique 충돌?
     /     \
   YES      NO
    ↓        ↓
재생성      완료
```

---

# 30. Short URL Redirect

Route

```text
/s/[shortCode]
```

예

```text
/s/aB39Kd
```

처리 과정

```text
사용자 접속
      ↓
shortCode 추출
      ↓
Supabase 조회
      ↓
landing_pages.short_code 검색
      ↓
original_url 확인
      ↓
Redirect
```

---

# 31. Redirect 방식

기본적으로

```text
302 Temporary Redirect
```

를 사용한다.

이유:

랜딩페이지 목적지가 나중에 변경될 가능성이 있기 때문이다.

같은 Short Code를 유지하면서

```text
original_url
```

만 변경할 수 있다.

---

# 32. Short URL 예시

DB

```text
name:
무료 웨비나

original_url:
https://example.com/webinar/2026

short_code:
aB39Kd
```

사용자 화면

```text
원본 URL
https://example.com/webinar/2026

짧은 URL
https://course-manager.vercel.app/s/aB39Kd

[복사]
```

---

# 33. Short URL 복사

Short URL 옆에

```text
복사
```

버튼 제공.

클릭하면 Clipboard 복사.

Toast

```text
짧은 주소가 복사되었습니다.
```

---

# 34. Vercel Preview 환경 처리

GitHub Pull Request를 생성하면 Vercel은 Preview Deployment를 생성할 수 있다.

예

```text
https://course-manager-git-feature-xxxxx.vercel.app
```

Preview 환경에서도

```text
window.location.origin
```

을 기준으로 Short URL을 표시한다.

따라서

```text
https://course-manager-git-feature-xxxxx.vercel.app/s/aB39Kd
```

형태로 테스트 가능하다.

---

# 35. Production URL 정책

실제 운영 중 사용자에게 공유하는 짧은 주소는 반드시 Production Deployment에서 복사하는 것을 원칙으로 한다.

예

권장

```text
https://course-manager.vercel.app/s/aB39Kd
```

Preview URL

```text
https://course-manager-git-feature-xxxxx.vercel.app/s/aB39Kd
```

은 테스트 용도로만 사용한다.

---

# 36. 랜딩페이지 관리 목록

| 이름 | 원본 URL | 짧은 URL | 관리 |
|---|---|---|---|
| 무료 웨비나 | 링크 | /s/aB39Kd | 수정 |
| 본 강의 | 링크 | /s/Kd92Pa | 수정 |

버튼

```text
+ 랜딩페이지 추가
```

---

# 37. 랜딩페이지 저장 방식

폼에서 새 랜딩페이지를 추가하면 Frontend 상태에 먼저 추가한다.

즉시 DB 저장하지 않는다.

사용자가

```text
저장
```

을 눌렀을 때 Supabase에 반영한다.

단, 실제 Insert 순간에 Short Code를 생성하는 것을 권장한다.

---

# 38. Short Code 생성 위치

Short Code는 Client에서 생성하지 않는다.

Server에서 생성한다.

권장 위치

```text
Next.js Server Action
```

또는

```text
Route Handler
```

사용.

이유:

- 중복 제어
- 보안
- DB 처리
- 데이터 일관성

---

# 39. TAB 4 — 자료 공유

강의와 관련된 외부 자료 링크를 관리한다.

지원 예시

- Google Drive
- Google Docs
- Google Sheets
- Google Slides
- Notion
- Figma
- Dropbox
- 기타 URL

---

# 40. 자료 공유 입력 필드

- 자료명
- 자료 유형
- URL

예

```text
자료명
강의 기획서

유형
Notion

URL
https://notion.so/xxxxx
```

---

# 41. 자료 공유 목록

| 자료명 | 유형 | 링크 | 관리 |
|---|---|---|---|
| 강의 기획서 | Notion | 열기 | 수정 |
| 강의 교안 | Drive | 열기 | 수정 |
| 광고 관리 | Sheets | 열기 | 수정 |

외부 링크는 새 탭에서 연다.

---

# 42. 데이터베이스 구조

사용 테이블

```text
courses
youtube_appearances
landing_pages
shared_resources
```

---

# 43. courses

```sql
create table courses (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    instructor_name text,

    webinar_at timestamptz,
    opening_at timestamptz,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

# 44. youtube_appearances

```sql
create table youtube_appearances (
    id uuid primary key default gen_random_uuid(),

    course_id uuid not null
        references courses(id)
        on delete cascade,

    channel_name text not null,

    appearance_fee bigint default 0,

    revenue_share numeric(5,2),

    contact_name text,
    contact_phone text,

    filming_at timestamptz,

    youtube_url text,

    sort_order integer default 0,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

# 45. landing_pages

```sql
create table landing_pages (
    id uuid primary key default gen_random_uuid(),

    course_id uuid not null
        references courses(id)
        on delete cascade,

    name text not null,

    original_url text not null,

    short_code varchar(20)
        not null
        unique,

    sort_order integer default 0,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

중요:

다음 필드는 만들지 않는다.

```text
short_url
```

Short URL 전체 문자열은 DB에 저장하지 않는다.

---

# 46. shared_resources

```sql
create table shared_resources (
    id uuid primary key default gen_random_uuid(),

    course_id uuid not null
        references courses(id)
        on delete cascade,

    name text not null,

    resource_type text,

    url text not null,

    sort_order integer default 0,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

# 47. DB 관계

```text
COURSES
   │
   ├──── YOUTUBE_APPEARANCES
   │
   ├──── LANDING_PAGES
   │
   └──── SHARED_RESOURCES
```

모두

```text
1 : N
```

관계.

---

# 48. Next.js Router 구조

```text
app/

dashboard/
    page.tsx

    courses/
        [courseId]/
            page.tsx

s/
    [shortCode]/
        route.ts
```

---

# 49. Short Redirect Route

파일

```text
app/s/[shortCode]/route.ts
```

역할

```text
shortCode 읽기
      ↓
Supabase 조회
      ↓
원본 URL 찾기
      ↓
Redirect
```

---

# 50. API 구조

Course

```text
GET    /api/courses
POST   /api/courses
PATCH  /api/courses/:id
DELETE /api/courses/:id
```

YouTube

```text
GET    /api/courses/:courseId/youtube
POST   /api/courses/:courseId/youtube
PATCH  /api/youtube/:id
DELETE /api/youtube/:id
```

Landing Page

```text
GET    /api/courses/:courseId/landing-pages
POST   /api/courses/:courseId/landing-pages
PATCH  /api/landing-pages/:id
DELETE /api/landing-pages/:id
```

Resource

```text
GET    /api/courses/:courseId/resources
POST   /api/courses/:courseId/resources
PATCH  /api/resources/:id
DELETE /api/resources/:id
```

---

# 51. Frontend 폴더 구조

```text
src/

app/

 ├ dashboard/
 │   ├ page.tsx
 │   └ courses/
 │       └ [courseId]/
 │           └ page.tsx
 │
 ├ api/
 │
 └ s/
     └ [shortCode]/
         └ route.ts

components/

 ├ layout/
 │   ├ sidebar.tsx
 │   └ header.tsx

 ├ courses/
 │   ├ course-create-modal.tsx
 │   ├ course-tabs.tsx
 │   └ course-basic-form.tsx

 ├ youtube/
 │   ├ youtube-list.tsx
 │   └ youtube-form.tsx

 ├ landing-pages/
 │   ├ landing-list.tsx
 │   └ landing-form.tsx

 └ resources/
     ├ resource-list.tsx
     └ resource-form.tsx

lib/

 ├ supabase/
 │   ├ client.ts
 │   └ server.ts
 │
 ├ short-code.ts
 └ utils.ts

types/

 └ database.ts
```

---

# 52. Short Code Utility

파일

```text
lib/short-code.ts
```

역할

```text
6자리 랜덤 문자열 생성
```

Character Set

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
```

---

# 53. 환경 변수

`.env.local`

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Short URL 생성을 위해

```text
NEXT_PUBLIC_APP_URL
```

을 반드시 사용할 필요는 없다.

기본적으로 현재 Request Origin 또는 Browser Origin을 사용한다.

---

# 54. Origin 처리

Client Side 표시

```text
window.location.origin
```

Server Side 필요 시 Request Header를 사용한다.

예

```text
host
x-forwarded-host
x-forwarded-proto
```

이를 기반으로 현재 배포 Origin을 계산한다.

---

# 55. URL 생성 함수

개념적으로 다음 구조를 사용한다.

```text
getOrigin()
+
"/s/"
+
shortCode
```

예

Local

```text
http://localhost:3000/s/aB39Kd
```

Production

```text
https://course-manager.vercel.app/s/aB39Kd
```

---

# 56. 강의 삭제

강의 메뉴

```text
⋮
```

선택

```text
강의 수정
강의 삭제
```

삭제 시 Confirm.

```text
이 강의를 삭제하시겠습니까?

강의에 등록된 유튜브, 랜딩페이지,
자료 공유 정보도 함께 삭제됩니다.
```

DB는

```text
ON DELETE CASCADE
```

사용.

---

# 57. UI 정책

관리자 SaaS 스타일.

참고 방향

- Linear
- Vercel
- Notion
- Slack Admin

특징

- Desktop 중심
- Table 중심
- 명확한 Tab
- 넓은 여백
- 과도한 Animation 금지
- 입력 속도 우선

---

# 58. Responsive

Desktop 우선.

권장 기준

```text
1280px 이상
```

Tablet 대응.

Mobile에서는 Sidebar를 Drawer로 변경.

---

# 59. Authentication

운영 환경에서는 Supabase Auth를 적용한다.

1차 방식

```text
Email + Password
```

경로

```text
/login
```

로그인 후

```text
/dashboard
```

비로그인 사용자는 `/login`으로 Redirect.

---

# 60. GitHub Repository

예

```text
course-manager
```

권장 Branch

```text
main
feature/*
```

개발 흐름

```text
Local
 ↓
Feature Branch
 ↓
GitHub Push
 ↓
Pull Request
 ↓
main Merge
 ↓
Vercel Production Deploy
```

---

# 61. Vercel Deployment

GitHub Repository를 Vercel과 연결한다.

main 브랜치 변경 시 자동 Production Deploy.

Vercel이 기본 도메인을 제공한다.

예

```text
https://course-manager.vercel.app
```

이 주소를 서비스 기본 주소 및 Short URL Base로 사용한다.

---

# 62. 별도 도메인 없이 운영

MVP에서는 다음을 하지 않는다.

- 도메인 구매
- DNS 설정
- 별도 Short URL 도메인
- Bitly 연동

Vercel 기본 주소만 이용한다.

---

# 63. 개발 환경별 동작

## Local

```text
http://localhost:3000
```

Short

```text
http://localhost:3000/s/aB39Kd
```

## Vercel Preview

```text
https://course-manager-git-xxx.vercel.app
```

Short

```text
https://course-manager-git-xxx.vercel.app/s/aB39Kd
```

## Vercel Production

```text
https://course-manager.vercel.app
```

Short

```text
https://course-manager.vercel.app/s/aB39Kd
```

---

# 64. MVP 필수 기능

1. 로그인
2. 강의 생성
3. 강의 수정
4. 강의 삭제
5. Sidebar 강의 목록
6. 기본 정보 관리
7. 유튜브 출연 다수 등록
8. 유튜브 수정
9. 유튜브 삭제
10. 랜딩페이지 다수 등록
11. Short Code 자동 생성
12. Vercel Origin 기반 Short URL 표시
13. Short URL 복사
14. Short URL Redirect
15. 자료 공유 다수 등록
16. 자료 수정
17. 자료 삭제
18. 각 탭 저장
19. Dirty State
20. 저장되지 않은 데이터 이동 경고
21. Supabase 연동
22. 로컬 실행
23. GitHub 관리
24. Vercel 배포

---

# 65. MVP 제외 기능

초기 버전에서는 다음을 제외한다.

- 결제
- 수강생 관리
- CRM
- 문자 발송
- 이메일 자동화
- 카카오톡
- Google Drive API 연동
- Notion API 연동
- YouTube API 연동
- URL 클릭 분석
- UTM 자동 생성
- 광고 성과 추적
- 자체 도메인

---

# 66. 향후 Short URL 클릭 분석

추후 다음 테이블을 추가할 수 있다.

```text
short_url_clicks
```

예 필드

```text
id
landing_page_id
clicked_at
referrer
user_agent
ip_hash
```

이를 통해 랜딩페이지별 클릭 횟수를 계산할 수 있다.

---

# 67. 향후 랜딩페이지 통계

예

```text
무료 웨비나
Short URL
/course-manager.vercel.app/s/aB39Kd

총 클릭
1,294

오늘
53

이번 주
318
```

MVP에서는 제외한다.

---

# 68. 향후 강의 상태

`courses` 테이블에 다음 필드를 추가할 수 있다.

```text
status
```

값 예

```text
기획
홍보중
웨비나 예정
모집중
진행중
종료
```

---

# 69. Dashboard 향후 확장

향후 첫 화면에 다음 내용을 표시할 수 있다.

```text
진행 중 강의
이번 달 웨비나
다가오는 유튜브 촬영
이번 달 출연료
활성 랜딩페이지
```

---

# 70. 개발 순서

## Phase 1

```text
Next.js 생성
TypeScript
Tailwind
shadcn/ui
GitHub Repository
```

## Phase 2

```text
Supabase 생성
DB Migration
Supabase Client 연결
```

## Phase 3

```text
Login
Dashboard Layout
Sidebar
```

## Phase 4

```text
강의 CRUD
```

## Phase 5

```text
기본 정보 탭
```

## Phase 6

```text
YouTube 출연 CRUD
```

## Phase 7

```text
Landing Page CRUD
Short Code 생성
Short URL 표시
Redirect
```

## Phase 8

```text
자료 공유 CRUD
```

## Phase 9

```text
Dirty State
Save Warning
Toast
Validation
```

## Phase 10

```text
GitHub Push
Vercel 연결
Production Deploy
```

---

# 71. Short URL Definition of Done

Short URL 기능이 완료되었다고 판단하는 조건은 다음과 같다.

1. 랜딩페이지 URL을 입력할 수 있다.
2. 저장 시 6자리 Short Code가 생성된다.
3. Short Code가 DB에 저장된다.
4. 전체 Short URL은 DB에 저장하지 않는다.
5. 로컬에서는 localhost 주소가 표시된다.
6. Vercel에서는 현재 Vercel Origin 주소가 표시된다.
7. Short URL을 복사할 수 있다.
8. `/s/{shortCode}`로 접속할 수 있다.
9. Supabase에서 원본 URL을 조회한다.
10. 원본 URL로 Redirect된다.
11. 잘못된 Short Code는 404 처리한다.
12. 동일 Short Code가 중복 생성되지 않는다.

---

# 72. 전체 MVP Definition of Done

다음 조건을 모두 만족하면 MVP 완료로 판단한다.

- 강의를 추가할 수 있다.
- 강의가 Sidebar에 추가된다.
- 강의를 선택할 수 있다.
- 강의 기본 정보를 저장할 수 있다.
- 유튜브 출연을 여러 개 등록할 수 있다.
- 유튜브 출연을 수정/삭제할 수 있다.
- 랜딩페이지를 여러 개 등록할 수 있다.
- Short Code가 자동 생성된다.
- Vercel 기본 도메인 기반 Short URL이 생성된다.
- 별도의 도메인이 없어도 Short URL이 동작한다.
- 자료 공유 링크를 여러 개 등록할 수 있다.
- 각 탭에 별도 저장 버튼이 존재한다.
- 저장하지 않은 상태에서 이동하면 경고한다.
- 모든 데이터가 Supabase에 저장된다.
- 로컬에서 실행된다.
- GitHub에서 소스 버전 관리가 된다.
- main Merge 후 Vercel Production Deploy가 된다.

---

# 73. 최종 아키텍처

```text
                       ┌──────────────┐
                       │     User     │
                       └──────┬───────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │        Vercel          │
                 │                        │
                 │ course-manager         │
                 │ .vercel.app            │
                 └───────────┬────────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌────────────────┐      ┌─────────────────┐
        │   Next.js App  │      │ /s/[shortCode]  │
        └───────┬────────┘      └────────┬────────┘
                │                        │
                │                        ▼
                │                 Supabase 조회
                │                        │
                ▼                        ▼
       ┌─────────────────┐        original_url
       │    Supabase     │               │
       │   PostgreSQL    │               ▼
       └─────────────────┘          302 Redirect
                                         │
                                         ▼
                                  Landing Page
```

---

# 74. 핵심 설계 원칙

## Course 중심

모든 데이터는 `course_id`를 기준으로 연결한다.

## 명시적 저장

자동저장은 사용하지 않는다.

## Short Code만 저장

DB에는

```text
aB39Kd
```

만 저장한다.

아래 주소는 저장하지 않는다.

```text
https://course-manager.vercel.app/s/aB39Kd
```

## 배포 주소 자동 사용

Short URL을 표시할 때 현재 실행 환경의 Origin을 사용한다.

따라서 동일 코드가

```text
Local
Vercel Preview
Vercel Production
향후 Custom Domain
```

모두에서 동작한다.

## Vercel 기본 도메인 우선

MVP 단계에서는 별도의 도메인 구매 없이

```text
*.vercel.app
```

주소를 그대로 사용한다.

## 확장 가능 구조

향후 자체 도메인을 연결해도 DB Migration 없이 동일 Short Code를 사용할 수 있어야 한다.

---

# 75. 최종 사용자 경험

운영자가 랜딩페이지에

```text
https://very-long-example.com/course/webinar?utm_source=youtube&utm_campaign=launch
```

를 입력하고 저장한다.

시스템이

```text
aB39Kd
```

를 생성한다.

Vercel Production 환경이라면 화면에는

```text
https://course-manager.vercel.app/s/aB39Kd
```

가 표시된다.

운영자는

```text
[복사]
```

버튼만 눌러 이 주소를 유튜브 설명란, 문자, 카카오톡, SNS 등에 사용할 수 있다.

사용자가 해당 Short URL을 클릭하면

```text
/s/aB39Kd
```

↓

Supabase 조회

↓

```text
https://very-long-example.com/course/webinar?utm_source=youtube&utm_campaign=launch
```

로 Redirect된다.

이 구조를 강의 관리 서비스 MVP의 Short URL 표준 방식으로 정의한다.