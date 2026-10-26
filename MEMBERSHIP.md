# 프로젝트 팀원 UI

백엔드 membership API와 함께 배포합니다. 프로젝트 응답의 myRole을 기준으로 수정/삭제/초대/역할/제거 버튼을 표시합니다. 마지막 LEAD 강등과 자기 제거를 화면에서 차단하고, 서버가 최종 권한을 검증합니다. 변경 및 충돌 후 프로젝트와 팀원을 다시 조회합니다. MEMBER는 조회만, CO_MANAGER는 프로젝트 수정과 일반 팀원 관리, LEAD는 역할 변경과 프로젝트 삭제가 가능합니다.

검증: `npm ci`, `npm test`, `npm run lint`, `npm run build`.
Windows 제한 환경에서 Vite의 기본 설정 번들러가 spawn EPERM을 발생시키면 다음 표준 옵션을 사용합니다:

```text
npm test -- --configLoader native --pool threads
npm run build -- --configLoader native
```

컴포넌트 테스트는 역할별 UI, 추가/제거, 마지막 LEAD 및 자기 제거 보호, 본인 강등 후 권한 갱신, 중복 충돌, 조회 실패 재시도를 검증합니다. Axios 테스트는 실제 요청 경로/메서드/body, withCredentials와 매 변경 전 CSRF 갱신을 검증합니다. UI 테스트의 API 응답은 mock입니다. 실제 브라우저 두 세션과 백엔드를 연결한 수동 검증은 별도로 필요합니다.

백엔드 기본 주소는 기존 http://localhost:8080입니다. 프론트 origin은 기존 허용 주소 localhost:5173/5174를 사용합니다. 다른 배포 주소/CORS는 배포 설정에 맞춰 별도 점검합니다.
