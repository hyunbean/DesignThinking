---
name: design-thinking
description: 디자인씽킹 6단계(Empathize → Define → Ideate → Prototype → Test → Assess) 전체 파이프라인을 단계별 프롬프트로 순차 실행. SMART 목표 입력부터 최종 사업성 평가까지 산출물을 이어서 생성한다 (실제 인터뷰 수행 구간만 사용자 개입 필요).
---

# Design Thinking Pipeline

Empathize부터 Assess까지 6개 단계(총 11개 스텝)를 독립된 프롬프트로 분리하고, 이전 스텝의 출력을 다음 스텝의 입력으로 그대로 전달하는 파이프라인. `prompts/` 폴더의 각 파일이 하나의 스텝 = 하나의 실행 지침이다.

## 스텝 실행 방법 (필수)

각 스텝을 실행할 때는 반드시 아래 절차를 따른다.

1. 해당 `prompts/*.md` 파일을 Read 도구로 읽는다.
2. 파일 안의 `{{PROJECT_TOPIC}}` / `{{TEAM_INSIGHTS}}` 플레이스홀더를 확정된 값으로 치환한다.
3. 치환된 프롬프트 전체(역할·임무·출력 양식·규칙)를 그 스텝의 작업 지침으로 삼아, 이전 스텝의 출력을 입력으로 산출물을 생성한다.
4. 컨텍스트 격리: 산출물 생성 시 해당 프롬프트 파일의 지침과 직전 스텝의 입력만 근거로 삼는다. 같은 대화에서 이전에 다룬 다른 아이디어/프로젝트의 내용을 섞지 않는다.

## 사용 전 준비물 (Context)

파이프라인을 돌리기 전에 아래 값을 사용자에게 확인한다. 없으면 진행하지 말고 먼저 물어볼 것.

- `{{PROJECT_TOPIC}}`: 팀의 주제 (예: "혁신적인 충전 솔루션 개발")
- `{{TEAM_INSIGHTS}}`: Define 단계 산출물인 POV/인사이트 목록. Empathize→Define을 이 파이프라인으로 직접 돌렸다면 [D3]의 "상위 3~5개 POV"를 그대로 쓰고, 이미 확정된 POV가 있으면 그걸 바로 쓴다.

`{{PROJECT_TOPIC}}`은 모든 프롬프트에, `{{TEAM_INSIGHTS}}`는 [I1] `ideate-idea-sheet.md` / [P1] `prototype-concept-sheet.md` / [T1] `test-point.md`의 자리에 채워 넣는다.

## 파이프라인 구조

스텝 라벨은 `단계 이니셜 + 순번`이다 (E=Empathize, D=Define, I=Ideate, P=Prototype, T=Test, A=Assess).

```
SMART 목표 + 가용 자원
      │
      ▼
[E1] prompts/empathize-find-interviewees.md → 대상자 선정기준 + 섭외전략 + 유형 breakdown
      │  "추천 인터뷰 대상자 유형" 추출
      ▼
[E2] prompts/empathize-questionnaire.md     → 유형별 인터뷰 질문지
      │
      │  (사용자가 실제 인터뷰 진행 후, 원본 발언/관찰 기록을 수집해 옴)
      ▼
[D1] prompts/define-clustering.md           → 카테고리별 클러스터링된 인사이트
      │
      ▼
[D2] prompts/define-pov.md                  → POV 진술서 목록
      │
      ▼
[D3] prompts/define-prioritize.md           → 우선순위 매긴 POV (상위 3~5개)
      │  = {{TEAM_INSIGHTS}}로 사용
      ▼
사용자 아이디어(한 줄)
      │
      ▼
[I1] prompts/ideate-idea-sheet.md      → 아이디어 시트 (텍스트)
      │  "스케치/비주얼" 필드 추출
      ▼
[I2] prompts/ideate-sketch.md          → 아이디어 스케치 (이미지 1종 또는 영문 이미지 프롬프트)
      │
      │  (사용자가 우선순위 높은 아이디어 시트 1개 이상 선택)
      ▼
[P1] prompts/prototype-concept-sheet.md → 컨셉 시트 (텍스트)
      │  "컨셉 스케치" 필드 추출
      ▼
[P2] prompts/prototype-illustration.md  → 컨셉 일러스트 (제품뷰+사용장면, 이미지 2종 또는 영문 이미지 프롬프트)
      │
      │  (컨셉 시트 전체를 다음 입력으로)
      ▼
[T1] prompts/test-point.md              → POINT 분석 (Plus/Opportunity/Issue/New Thinking)
      │  New Thinking 반영해 컨셉 시트 갱신
      ▼
[A1] prompts/assess-vip.md              → VIP 평가 + Core Components (최종 산출물)
```

## 이미지 스텝 ([I2], [P2]) 처리 규칙

Claude Code는 자체적으로 이미지를 생성할 수 없다. 이미지 스텝은 실행 환경에 따라 다음과 같이 처리한다.

- **이미지 생성 도구(MCP 등)가 연결된 경우**: 프롬프트 파일의 스타일 가이드라인을 반영해 이미지를 직접 생성하고 `output/` 폴더에 저장한다.
- **이미지 생성 도구가 없는 경우 (기본)**: 스타일 가이드라인을 전부 반영한 **완성형 영문 이미지 생성 프롬프트**를 산출물로 작성해 저장한다. 사용자가 이 프롬프트를 외부 이미지 모델(Gemini, Midjourney, DALL-E 등)에 붙여넣어 이미지를 얻는다.

## 실행 모드

사용자 입력에서 아래 서브커맨드를 파싱해 해당 단계만 실행하거나, `전체`/`run all`이면 처음부터 끝까지 순차 실행한다.

| 입력 | 실행 스텝 |
|---|---|
| `empathize {SMART 목표 + 가용 자원}` | [E1] → [E2] 순서로 실행, 대상자 전략과 유형별 질문지를 함께 제시 |
| `define {인터뷰 원본 결과}` | [D1] → [D2] → [D3], 최종 상위 POV까지 제시 |
| `ideate {아이디어 한 줄}` | [I1] → [I2] 순서로 실행, 아이디어 시트와 스케치(또는 이미지 프롬프트)를 함께 제시 |
| `prototype {아이디어 시트(들)}` | [P1] → [P2] |
| `test {컨셉 시트}` | [T1] |
| `assess {POINT 반영된 컨셉 시트}` | [A1] |
| `전체 {SMART 목표}` / `run all {목표}` | [E1]→[E2]→(인터뷰 실사 대기)→[D1]→[D2]→[D3]→[I1]→[I2]→(사용자 확인)→[P1]→[P2]→[T1]→[A1] 전부 순차 실행. [E2]와 [D1] 사이는 사용자가 실제 인터뷰를 진행해야 하는 구간이므로 자동 진행하지 않고 반드시 사용자 입력을 기다린다. |
| (인자 없음) | 이 표를 사용자에게 보여주고 어떤 단계부터 시작할지 질문 |

## 단계 간 데이터 전달 규칙

1. 각 스텝의 출력은 다음 스텝 프롬프트에 **그대로** 입력으로 넘긴다 — 임의로 요약하거나 문장을 바꾸지 않는다.
2. [I1]→[I2], [P1]→[P2]는 이미지 스텝이므로 반드시 해당 프롬프트 파일의 "입력 처리 프로세스"를 따라 텍스트를 영어 라벨로 변환한 뒤 위 "이미지 스텝 처리 규칙"대로 산출한다.
3. [T1]→[A1]로 넘어갈 때는 **이 스킬을 실행하는 메인 에이전트가** New Thinking에서 제안된 개선안을 컨셉 시트의 각 필드에 직접 병합해 "갱신된 컨셉 시트"를 만들고, 그것을 [A1]의 입력으로 쓴다. POINT 분석 원본을 그대로 넘기지 않는다. 갱신본도 `output/`에 별도 저장한다.
4. [E2]→[D1] 사이에는 실제 인터뷰 수행이라는 사람의 개입이 반드시 필요하다 — 이 구간을 AI가 임의로 생략하거나 가짜 인터뷰 데이터를 지어내서 다음 단계로 넘기지 않는다.
5. [D3]의 "상위 3~5개 POV"는 그대로 `{{TEAM_INSIGHTS}}`에 채워 넣는다.
6. 각 프롬프트는 "Stateless" 원칙을 가진다 — 파이프라인을 여러 아이디어/프로젝트에 대해 반복 실행할 때, 이전 실행의 산출물이 다음 처리에 섞이지 않도록 "스텝 실행 방법" 4번을 지킨다.

## 산출물 저장

실행 결과는 `output/{날짜}-{아이디어슬러그}/` 폴더에 스텝 라벨을 접두어로 붙여 저장한다 (예: `output/2026-07-10-safedock-charger/I1-idea-sheet.md`, `I2-sketch-prompt.md`, `P1-concept-sheet.md` ...). 폴더가 없으면 생성한다.
