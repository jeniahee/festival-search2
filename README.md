# 축제 한눈에

한국관광공사 `searchFestival2`를 이용한 단일 화면 축제 검색 웹앱입니다.

## 실행

PowerShell에서 서비스키를 환경변수로 설정한 뒤 실행합니다.

```powershell
$env:TOUR_API_KEY = "발급받은_서비스키"
node server.js
```

브라우저에서 `http://localhost:3000`을 엽니다.

서비스키가 없으면 화면은 데모 결과로 동작합니다. 실제 API 요청은 `api/festivals.js`가 대신 보내며, 키는 브라우저 코드에 포함하지 않습니다.

배포 환경의 환경변수 이름은 `DATA_GO_KR_API_KEY`입니다. 포털에서 복사한 `%` 포함 인증키를 값 그대로 저장합니다.

## 검색 동작

- 날짜와 지역은 `searchFestival2`의 `eventStartDate`, `eventEndDate`, `lDongRegnCd`로 전달합니다.
- 매뉴얼상 `searchFestival2`에는 키워드 입력값이 없으므로, 키워드는 서버에서 받아온 `title`과 `addr1`을 기준으로 필터링합니다.
- 대표 이미지가 없는 항목은 이미지 없음 표시로 대체합니다.
