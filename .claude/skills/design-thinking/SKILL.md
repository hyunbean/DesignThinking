---
name: design-thinking
description: 디자인씽킹 5단계(Empathize → Define → Ideate → Prototype → Test → Assess) 전체 파이프라인을 서브에이전트 프롬프트로 순차 실행. SMART 목표만 입력하면 인터뷰 설계부터 최종 사업성 평가까지 산출물을 이어서 생성한다.
---

# Design Thinking Pipeline

Empathize부터 Assess까지 6개 스테이지 전부를 독립된 프롬프트(서브에이전트)로 분리하고, 이전 단계 출력을 다음 단계 입력으로 그대로 전달하는 파이프라인. `prompts/` 폴더의 각 파일이 하나의 스테이지 = 하나의 시스템 프롬프트다.

## 사용 전 준비물 (Context)

파이프라인을 돌리기 전에 아래 값을 사용자에게 확인한다. 없으면 진행하지 말고 먼저 물어볼 것.

- `{{PROJECT_TOPIC}}`: 팀의 주제 (예: "혁신적인 충전 솔루션 개발")
- `{{TEAM_INSIGHTS}}`: Define 단계 산출물인 POV/인사이트 목록. Empathize→Define을 이 파이프라인으로 직접 돌렸다면 `define-prioritize.md`의 "상위 3~5개 POV"를 그대로 쓰고, 이미 확정된 POV가 있으면 그걸 바로 쓴다.

`{{PROJECT_TOPIC}}`은 모든 프롬프트에, `{{TEAM_INSIGHTS}}`는 `ideate-idea-sheet.md` / `prototype-concept-sheet.md` / `test-point.md`의 자리에 채워 넣고 시스템 프롬프트로 사용한다.

## 파이프라인 구조

```
SMART 목표 + 가용 자원
      │
      ▼
[0a] prompts/empathize-find-interviewees.md → 대상자 선정기준 + 섭외전략 + 유형 breakdown
      │  "추천 인터뷰 대상자 유형" 추출
      ▼
[0b] prompts/empathize-questionnaire.md     → 유형별 인터뷰 질문지
      │
      │  (사용자가 실제 인터뷰 진행 후, 원본 발언/관찰 기록을 수집해 옴)
      ▼
[0c] prompts/define-clustering.md           → 카테고리별 클러스터링된 인사이트
      │
      ▼
[0d] prompts/define-pov.md                  → POV 진술서 목록
      │
      ▼
[0e] prompts/define-prioritize.md           → 우선순위 매긴 POV (상위 3~5개)
      │  = {{TEAM_INSIGHTS}}로 사용
      ▼
사용자 아이디어(한 줄)
      │
      ▼
[1] prompts/ideate-idea-sheet.md      → 아이디어 시트 (텍스트)
      │  "스케치/비주얼" 필드 추출
      ▼
[2] prompts/ideate-sketch.md          → 아이디어 스케치 (이미지 1종)
      │
      │  (사용자가 우선순위 높은 아이디어 시트 1개 이상 선택)
      ▼
[3] prompts/prototype-concept-sheet.md → 컨셉 시트 (텍스트)
      │  "컨셉 스케치" 필드 추출
      ▼
[4] prompts/prototype-illustration.md  → 컨셉 일러스트 (제품 뷰 + 사용 장면, 이미지 2종)
      │
      │  (컨셉 시트 전체를 다음 입력으로)
      ▼
[5] prompts/test-point.md              → POINT 분석 (Plus/Opportunity/Issue/New Thinking)
      │  New Thinking 반영해 컨셉 시트 갱신
      ▼
[6] prompts/assess-vip.md              → VIP 평가 + Core Components (최종 산출물)
```

## 실행 모드

사용자 입력에서 아래 서브커맨드를 파싱해 해당 단계만 실행하거나, `전체`/`run all`이면 처음부터 끝까지 순차 실행한다.

| 입력 | 실행 단계 |
|---|---|
| `empathize {SMART 목표 + 가용 자원}` | [0a] → [0b] 순서로 실행, 대상자 전략과 유형별 질문지를 함께 제시 |
| `define {인터뷰 원본 결과}` | [0c] → [0d] → [0e], 최종 상위 POV까지 제시 |
| `ideate {아이디어 한 줄}` | [1] → [2] 순서로 실행, 사용자에게 아이디어 시트와 스케치 프롬프트 결과를 함께 제시 |
| `prototype {아이디어 시트(들)}` | [3] → [4] |
| `test {컨셉 시트}` | [5] |
| `assess {POINT 반영된 컨셉 시트}` | [6] |
| `전체 {SMART 목표}` / `run all {목표}` | [0a]→[0b]→(인터뷰 실사 대기)→[0c]→[0d]→[0e]→[1]→[2]→(사용자 확인)→[3]→[4]→[5]→[6] 전부 순차 실행. [0b]와 [0c] 사이는 사용자가 실제 인터뷰를 진행해야 하는 구간이므로 자동 진행하지 않고 반드시 사용자 입력을 기다린다. |
| (인자 없음) | 이 표를 사용자에게 보여주고 어떤 단계부터 시작할지 질문 |

## 단계 간 데이터 전달 규칙

1. 각 단계의 출력은 다음 단계 프롬프트에 **그대로** 입력으로 넘긴다 — 임의로 요약하거나 문장을 바꾸지 않는다.
2. [1]→[2], [3]→[4]는 이미지 생성 프롬프트이므로 반드시 해당 프롬프트 파일의 "입력 처리 프로세스"를 따라 텍스트를 영어 라벨로 변환한 뒤 이미지를 생성한다.
3. [5]→[6]으로 넘어갈 때는 New Thinking에서 제안된 개선안을 컨셉 시트에 반영한 "갱신된 컨셉 시트"를 [6]의 입력으로 쓴다. POINT 분석 원본을 그대로 넘기지 않는다.
4. [0b]→[0c] 사이에는 실제 인터뷰 수행이라는 사람의 개입이 반드시 필요하다 — 이 구간을 AI가 임의로 생략하거나 가짜 인터뷰 데이터를 지어내서 다음 단계로 넘기지 않는다.
5. [0e]의 "상위 3~5개 POV"는 그대로 `{{TEAM_INSIGHTS}}`에 채워 넣는다.
6. 각 프롬프트는 "Stateless" 원칙을 가지고 있음 — 파이프라인을 여러 아이디어/프로젝트에 대해 반복 실행할 때, 이전 실행의 산출물이 다음 처리에 섞이지 않도록 매번 새 컨텍스트로 호출한다.

## 산출물 저장

실행 결과는 `output/{날짜}-{아이디어슬러그}/` 폴더에 단계별로 저장한다 (예: `output/2026-07-10-safedock-charger/01-idea-sheet.md`, `02-sketch-prompt.md`, `03-concept-sheet.md` ...). 폴더가 없으면 생성한다.
