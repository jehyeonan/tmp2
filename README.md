# 파주시청 바이브코딩 4회차 Starter Package

팀별 CSV 제출 파일을 통합하고, 누락·형식 오류·중복 후보를 검토한 뒤 결과 CSV로 내려받는 수업용 Vercel 프로젝트입니다.

> 실제 개인정보, 민원 원문, 내부자료, 예산·계약 자료는 업로드하지 않습니다. 수업용 가상 CSV만 사용합니다.

## 핵심 기능

- 팀명·제출자·CSV 파일을 업로드 목록에 추가
- 수업용 샘플 CSV를 불러와 흐름 즉시 확인
- 처리상태·우선순위 표준화, 기한 누락·형식 오류·중복 후보 점검
- 결과 필터: 전체, 확인 필요, 중복 의심, 기한 누락, 형식 오류
- 행별 상세 보기와 통합 CSV 다운로드
- `/api/apply-rules` 연결 실패 시 브라우저 fallback 규칙 적용

## 프로젝트 구조

```text
.
├─ index.html                 # 화면 구조와 모듈 진입점
├─ styles/
│  └─ review.css              # 반응형 화면·접근성 스타일
├─ src/
│  ├─ app.js                  # 이벤트 연결과 화면 갱신
│  ├─ state.js                # 화면 상태
│  ├─ constants.js            # CSV 헤더와 샘플 데이터
│  ├─ csv.js                  # CSV 파싱·다운로드 변환
│  ├─ normalise.js            # 상태·우선순위·날짜 표준화
│  ├─ review.js               # 검토 규칙과 요약
│  ├─ uploads.js              # 업로드 목록 관리
│  ├─ process.js              # Vercel API·fallback 처리
│  ├─ dom.js                  # 공통 DOM 렌더링
│  └─ results-view.js         # 필터·상세 검토 화면
├─ api/
│  └─ apply-rules.js          # Vercel Serverless Function
└─ sample-data/
   ├─ team-a-upload.csv
   ├─ team-b-upload.csv
   └─ team-c-upload.csv
```

## CSV 필수 열

```text
팀명, 제출자, 부서명, 업무유형, 제목, 처리상태, 처리기한, 우선순위, 내용
```

## 처리 규칙

- 처리상태: `진행중 → 진행`, `대기 → 미확인`, `보류 → 확인필요` 등으로 표준화
- 우선순위: `긴급·상 → 높음`, `중 → 보통`, `하 → 낮음` 등으로 표준화
- 처리기한: 누락 여부와 `YYYY-MM-DD` 형식을 점검
- 중복 후보: `부서명 + 업무유형 + 제목 + 처리기한 + 내용`이 같은 행을 표시
- 결과: `중복여부`, `확인필요`, `정리메모`를 추가

## 로컬 확인

1. VS Code에서 폴더를 엽니다.
2. `index.html`을 Live Server로 실행합니다.
3. 샘플 CSV를 불러온 뒤 규칙 적용, 필터, 상세 보기, 결과 다운로드를 확인합니다.

로컬에서 API 연결이 되지 않으면 브라우저 fallback 규칙으로 결과가 생성됩니다. Vercel에 배포한 뒤에는 `/api/apply-rules` 서버 함수 응답도 함께 확인합니다.

## 안전 기준

- 실제 개인정보, 민원 원문, 내부자료, 계약자료, 예산자료를 넣지 않습니다.
- API 키와 비밀값을 HTML이나 JavaScript 파일에 적지 않습니다.
- Vercel 로그에 실제 개인정보가 남지 않도록 샘플 데이터만 사용합니다.
