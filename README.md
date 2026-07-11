# design-thinking

디자인씽킹 6단계(Empathize → Define → Ideate → Prototype → Test → Assess) 전체를 단계별 프롬프트 파이프라인으로 실행하는 [Claude Code](https://claude.com/claude-code) 스킬.

SMART 목표를 입력하면 인터뷰 설계 → 인사이트 정의 → 아이디어 시트 → 컨셉 시트 → POINT 평가 → 사업성(VIP) 평가까지 산출물이 체인으로 이어진다. 실제 인터뷰 수행 구간만 사람이 개입한다.

## 사용법

이 폴더를 Claude Code에서 열면 `.claude/skills/design-thinking/`이 자동 인식된다. `/design-thinking`을 호출하면 SKILL.md의 라우팅을 따른다.

```
/design-thinking empathize SMART 목표: ... / 가용 자원: 팀원 5명, 1주일
/design-thinking define {인터뷰 원본 결과 붙여넣기}
/design-thinking ideate 콘센트에 꽂으면 바로 거치되는 무선 충전기
/design-thinking 전체 {SMART 목표}
```

인자 없이 `/design-thinking`만 입력하면 실행 가능한 단계 목록을 보여준다.

## 구조

```
.claude/skills/design-thinking/
  SKILL.md                            ← 라우팅 + 파이프라인 정의 + 실행 규칙
  prompts/
    empathize-find-interviewees.md    ← [E1] 인터뷰 대상자 선정기준 + 섭외전략
    empathize-questionnaire.md        ← [E2] 유형별 인터뷰 질문지 생성
    define-clustering.md              ← [D1] 인터뷰 결과 클러스터링
    define-pov.md                     ← [D2] POV 진술서 생성
    define-prioritize.md              ← [D3] POV 우선순위 평가 (시장영향력/차별화)
    ideate-idea-sheet.md              ← [I1] 아이디어 시트 생성
    ideate-sketch.md                  ← [I2] 아이디어 스케치 (이미지 or 영문 이미지 프롬프트)
    prototype-concept-sheet.md        ← [P1] 컨셉 시트 생성
    prototype-illustration.md         ← [P2] 컨셉 일러스트 (제품뷰+사용장면)
    test-point.md                     ← [T1] POINT 프레임워크 평가
    assess-vip.md                     ← [A1] VIP 평가 + Core Components
output/                               ← 실행 결과 저장 위치
```

## 설계 의도

- **단일 프롬프트가 아니라 11개 스텝으로 분해한 이유** — 단계마다 요구되는 역할(리서치 기획자, UX 리서처, 전략 기획자, 비주얼 퍼실리테이터...)과 출력 양식이 전혀 달라서, 하나의 긴 프롬프트로 합치면 앞 단계의 컨텍스트가 뒤 단계 출력을 오염시킨다. 각 스텝은 "직전 스텝의 출력 + 자기 프롬프트 파일"만 근거로 삼는 Stateless 원칙으로 설계했다.
- **인터뷰 구간([E2]→[D1])을 자동화하지 않은 이유** — 인터뷰 데이터는 파이프라인 전체의 근거가 되는 유일한 실측 데이터다. AI가 이 구간을 지어내면 이후 모든 산출물이 그럴듯한 할루시네이션이 된다. 그래서 이 구간은 반드시 사용자 입력을 기다리도록 규칙으로 강제했다.
- **이미지 스텝을 프롬프트 산출로 이원화한 이유** — Claude Code는 자체 이미지 생성이 불가능하다. 이미지 생성 도구(MCP)가 연결된 환경에서는 직접 생성하고, 없으면 스타일 가이드가 전부 반영된 완성형 영문 프롬프트를 산출해 외부 이미지 모델에 바로 붙여넣을 수 있게 했다.
- **평가 기준을 프롬프트에 하드코딩하지 않고 가중치로 노출** — POV 우선순위([D3])의 시장영향력/차별화 가중치(기본 1/3 : 2/3)는 사용자가 재지정할 수 있다.

## 출처

각 프롬프트는 캡스톤디자인 수업(Design Thinking, Prof. Do-Hyung Park) 강의자료의 프레임워크(POV, HMW, Idea Sheet, Concept Sheet, POINT, VIP&Core Components)를 참고해 재구성함. 강의자료 원문은 재게시하지 않음 — 프레임워크 구조만 프롬프트 형태로 재작성.

## Roadmap

- [ ] 전 단계를 실제 주제로 완주한 예시 산출물을 `examples/`에 추가
- [ ] 각 스텝을 `.claude/agents/` 서브에이전트로 분리해 컨텍스트 격리를 구조적으로 보장 (현재는 SKILL.md의 실행 규칙에 의존)
- [ ] 이미지 생성 MCP 연동 시 [I2]/[P2]에서 이미지 파일을 `output/`에 직접 저장

## License

[MIT](LICENSE)
