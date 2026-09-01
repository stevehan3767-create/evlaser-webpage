# EV Laser 홈페이지

EV Laser(㈜이브이레이저) 공식 홈페이지 — Next.js(App Router) + TypeScript + Tailwind CSS로 구현.

## 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 현재 범위 (1차)

- 홈페이지 1개 페이지 (한글 버전)
- 히어로(자동 슬라이드), 슬로건 배너, 산업분야 13종, 레이저 기술 14종, 사이트 구조도,
  자료실, 글로벌 네트워크(지사·대리점), 뉴스, 채용, 대표이사 직속 소통센터, 문의 폼(데모)

## 이후 단계 (예정)

- 개별 서브페이지(회사소개 상세, 제품 상세, 뉴스 목록 등)
- 실제 문의 폼 전송 (이메일 연동)
- 관리자 모드 + 자료실 DB 연동
- 영어·중국어·일본어 다국어 버전
- 로고 최종본 확정 및 교체

## 폴더 구조

```
src/
  app/            Next.js App Router 진입점 (layout, page, globals.css)
  components/     화면 섹션별 컴포넌트
  lib/data.ts     산업/기술/뉴스/채용 등 콘텐츠 데이터
```
