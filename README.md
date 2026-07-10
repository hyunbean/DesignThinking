# design-thinking-pipeline

디자인씽킹 Ideate→Prototype→Test→Assess 단계를 서브에이전트 프롬프트로 나눠 순차 실행하는 Claude Code 스킬.

## 사용법

Claude Code에서 이 폴더를 열고 `/design-thinking`을 호출하면 `.claude/skills/design-thinking/SKILL.md`의 라우팅을 따른다.

```
/design-thinking empathize SMART 목표: ... / 가용 자원: 팀원 5명, 1주일
/design-thinking define {인터뷰 원본 결과 붙여넣기}
/design-thinking ideate 콘센트에 꽂으면 바로 거치되는 무선 충전기
/design-thinking 전체 {SMART 목표}
```

## 구조

```
.claude/skills/design-thinking/
  SKILL.md                            ← 라우팅 + 파이프라인 정의
  prompts/
    empathize-find-interviewees.md    ← [0a] 인터뷰 대상자 선정기준 + 섭외전략
    empathize-questionnaire.md        ← [0b] 유형별 인터뷰 질문지 생성
    define-clustering.md              ← [0c] 인터뷰 결과 클러스터링
    define-pov.md                     ← [0d] POV 진술서 생성
    define-prioritize.md              ← [0e] POV 우선순위 평가 (시장영향력/차별화)
    ideate-idea-sheet.md              ← [1] 아이디어 시트 생성
    ideate-sketch.md                  ← [2] 아이디어 스케치 이미지 생성
    prototype-concept-sheet.md        ← [3] 컨셉 시트 생성
    prototype-illustration.md         ← [4] 컨셉 일러스트(제품뷰+사용장면) 생성
    test-point.md                     ← [5] POINT 프레임워크 평가
    assess-vip.md                     ← [6] VIP 평가 + Core Components
output/                               ← 실행 결과 저장 위치
```

## 출처

각 프롬프트는 캡스톤디자인 수업(Design Thinking, Prof. Do-Hyung Park) 강의자료의 프레임워크(POV, HMW, Idea Sheet, Concept Sheet, POINT, VIP&Core Components)를 참고해 재구성함. 강의자료 원문은 재게시하지 않음 — 프레임워크 구조만 프롬프트 형태로 재작성.

## TODO

- [ ] PM 오케스트레이터 에이전트로 6단계 자동 체이닝 (현재는 SKILL.md 라우팅에 의존)
- [ ] `{{PROJECT_TOPIC}}` / `{{TEAM_INSIGHTS}}` 치환을 스크립트로 자동화 (현재는 수동으로 프롬프트 파일에 채워 넣어야 함)
