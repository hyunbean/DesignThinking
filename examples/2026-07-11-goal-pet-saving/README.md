# 예시 실행: 대학생 목표 저축 서비스

`/design-thinking 전체` 파이프라인을 E1부터 A1까지 실제로 완주한 예시 산출물.

## 실행 컨텍스트

- **`{{PROJECT_TOPIC}}`**: 대학생의 소비 관리와 저축 습관 형성을 돕는 금융 서비스 개발
- **SMART 목표** (예시용): 4주 안에 월 소득 60만원 내외 대학생의 소비·저축 페인포인트를 인터뷰로 검증하고, 저축 지속률을 높이는 서비스 컨셉 1개를 도출해 POINT·VIP 평가까지 완료한다.
- **가용 자원**: 팀원 4명, 4주

## 데이터 출처

- [interview-notes.md](interview-notes.md)의 인터뷰 데이터는 **실제 캡스톤 수업에서 수행한 인터뷰 1건**이다 (개인정보 보호를 위해 익명 처리: 참여자 A). 파이프라인 규칙대로 E2→D1 구간의 인터뷰는 AI가 생성하지 않았다.
- E1(대상자 전략)·E2(질문지)는 SMART 목표로부터 생성한 산출물이며, 실제 인터뷰는 이 중 "현재 대학생 소비자" 유형 1명에 대해 수행된 것이다.
- I1의 입력 아이디어(한 줄): "저축할수록 동물이 성장하는, 게임과 결합된 저축 앱"
- [I2-sketch-prompt.md](I2-sketch-prompt.md) / [P2-illustration-prompts.md](P2-illustration-prompts.md)의 영문 프롬프트로 Gemini(Nano Banana)를 통해 실제 생성한 이미지: [I2-sketch.png](I2-sketch.png), [P2-product.png](P2-product.png), [P2-usage.png](P2-usage.png)

## 생성된 이미지

| [I2] 아이디어 스케치 | [P2] 제품/컨셉 일러스트 | [P2] 사용 장면 일러스트 |
|---|---|---|
| ![아이디어 스케치](I2-sketch.png) | ![제품 일러스트](P2-product.png) | ![사용 장면 일러스트](P2-usage.png) |

## 산출물 목록 (파이프라인 순서)

| 스텝 | 파일 | 산출물 |
|---|---|---|
| [E1] | [E1-interviewee-strategy.md](E1-interviewee-strategy.md) | 인터뷰 대상자 선정기준 + 섭외전략 |
| [E2] | [E2-questionnaires.md](E2-questionnaires.md) | 유형별 인터뷰 질문지 |
| — | [interview-notes.md](interview-notes.md) | 실제 인터뷰 기록 (사용자 개입 구간) |
| [D1] | [D1-clustering.md](D1-clustering.md) | 인사이트 클러스터링 |
| [D2] | [D2-pov.md](D2-pov.md) | POV 진술서 목록 |
| [D3] | [D3-prioritized-pov.md](D3-prioritized-pov.md) | POV 우선순위 평가 |
| [I1] | [I1-idea-sheet.md](I1-idea-sheet.md) | 아이디어 시트 |
| [I2] | [I2-sketch-prompt.md](I2-sketch-prompt.md) → [I2-sketch.png](I2-sketch.png) | 스케치용 영문 이미지 프롬프트 + 생성 이미지 |
| [P1] | [P1-concept-sheet.md](P1-concept-sheet.md) | 컨셉 시트 |
| [P2] | [P2-illustration-prompts.md](P2-illustration-prompts.md) → [P2-product.png](P2-product.png), [P2-usage.png](P2-usage.png) | 일러스트용 영문 이미지 프롬프트 2종 + 생성 이미지 2장 |
| [T1] | [T1-point-analysis.md](T1-point-analysis.md) | POINT 분석 |
| [T1] | [P1-concept-sheet-revised.md](P1-concept-sheet-revised.md) | New Thinking 반영 갱신 컨셉 시트 |
| [A1] | [A1-vip-assessment.md](A1-vip-assessment.md) | VIP 평가 + Core Components |
