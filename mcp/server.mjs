#!/usr/bin/env node
/**
 * Design Thinking MCP Server
 *
 * .claude/ 에 Claude Code 전용으로 들어있던 디자인씽킹 파이프라인(11스텝)을
 * MCP 도구로 노출한다. MCP를 지원하는 어떤 클라이언트에서도 같은 방법론을 쓸 수 있다.
 *
 * 설계 원칙: 이 서버는 LLM을 호출하지 않는다. "각 스텝의 작업 지침과 예시"를
 * 제공할 뿐이고, 실제 산출물 생성은 클라이언트 쪽 모델이 수행한다.
 * 방법론(무엇을 어떤 순서로, 무엇을 넘겨서)이 서버의 자산이다.
 *
 * 의존성 없음 — `node mcp/server.mjs` 로 바로 실행된다.
 * 전송 방식: stdio + 개행 구분 JSON-RPC 2.0
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_DIR = join(ROOT, '.claude', 'agents');
const EXAMPLES_DIR = join(ROOT, 'examples');
const SKILL_FILE = join(ROOT, '.claude', 'skills', 'design-thinking', 'SKILL.md');

const SERVER_NAME = 'design-thinking';
const SERVER_VERSION = '1.0.0';
const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const DEFAULT_PROTOCOL = '2024-11-05';

/* ── 파이프라인 정의 ─────────────────────────────────────────────── */

const STAGES = [
  { id: 'E1', phase: 'Empathize', agent: 'dt-e1-interviewee-strategy',
    title: '인터뷰 대상자 선정·섭외 전략',
    input: 'SMART 목표 + 가용 자원',
    output: '선정 기준 · 섭외 전략 · 대상자 유형 breakdown' },
  { id: 'E2', phase: 'Empathize', agent: 'dt-e2-questionnaire',
    title: '유형별 인터뷰 질문지',
    input: '[E1]의 대상자 유형 breakdown',
    output: '유형별 질문지',
    humanGateAfter: '실제 인터뷰 수행 — AI가 인터뷰 데이터를 지어내면 안 된다' },
  { id: 'D1', phase: 'Define', agent: 'dt-d1-clustering',
    title: '인사이트 클러스터링',
    input: '인터뷰 원본 발언·관찰 기록',
    output: '카테고리별 클러스터링된 인사이트' },
  { id: 'D2', phase: 'Define', agent: 'dt-d2-pov',
    title: 'POV 진술서 작성',
    input: '[D1] 클러스터링 결과',
    output: 'POV 진술서 목록' },
  { id: 'D3', phase: 'Define', agent: 'dt-d3-prioritize',
    title: 'POV 우선순위화',
    input: '[D2] POV 목록',
    output: '상위 3~5개 POV — 이후 TEAM_INSIGHTS 로 사용' },
  { id: 'I1', phase: 'Ideate', agent: 'dt-i1-idea-sheet',
    title: '아이디어 시트',
    input: '아이디어 한 줄 + TEAM_INSIGHTS',
    output: '아이디어 시트 (스케치/비주얼 필드 포함)' },
  { id: 'I2', phase: 'Ideate', agent: 'dt-i2-sketch',
    title: '아이디어 스케치',
    input: '[I1]의 "스케치/비주얼" 필드',
    output: '영문 이미지 프롬프트 + 스케치 이미지 1종',
    image: true },
  { id: 'P1', phase: 'Prototype', agent: 'dt-p1-concept-sheet',
    title: '컨셉 시트',
    input: '선택된 아이디어 시트 + TEAM_INSIGHTS',
    output: '컨셉 시트 (컨셉 스케치 필드 포함)' },
  { id: 'P2', phase: 'Prototype', agent: 'dt-p2-illustration',
    title: '컨셉 일러스트',
    input: '[P1]의 "컨셉 스케치" 필드',
    output: '영문 프롬프트 + 제품뷰/사용장면 이미지 2종',
    image: true },
  { id: 'T1', phase: 'Test', agent: 'dt-t1-point',
    title: 'POINT 분석',
    input: '컨셉 시트 전문 + TEAM_INSIGHTS',
    output: 'Plus / Opportunity / Issue / New Thinking',
    note: 'New Thinking 을 컨셉 시트에 병합해 "갱신된 컨셉 시트"를 만든 뒤 [A1]에 넘긴다 (POINT 원본을 그대로 넘기지 않는다)' },
  { id: 'A1', phase: 'Assess', agent: 'dt-a1-vip',
    title: 'VIP 평가 + Core Components',
    input: '갱신된 컨셉 시트',
    output: 'VIP 평가 · Core Components (최종 산출물)' },
];

const byId = Object.fromEntries(STAGES.map(s => [s.id, s]));
const STAGE_IDS = STAGES.map(s => s.id);

/* ── 파일 읽기 헬퍼 ──────────────────────────────────────────────── */

function stripFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length).trimStart() : text;
}

function readAgentBody(stage) {
  const file = join(AGENTS_DIR, `${stage.agent}.md`);
  if (!existsSync(file)) throw new Error(`에이전트 정의 파일을 찾을 수 없습니다: ${stage.agent}.md`);
  return stripFrontmatter(readFileSync(file, 'utf8')).trimEnd();
}

/** examples/ 아래 실행 폴더들에서 `{ID}-` 로 시작하는 산출물을 찾는다. */
function findExamples(stageId) {
  if (!existsSync(EXAMPLES_DIR)) return [];
  const found = [];
  for (const run of readdirSync(EXAMPLES_DIR, { withFileTypes: true })) {
    if (!run.isDirectory()) continue;
    const runDir = join(EXAMPLES_DIR, run.name);
    for (const f of readdirSync(runDir)) {
      if (!f.startsWith(`${stageId}-`)) continue;
      if (!/\.(md|txt)$/i.test(f)) { found.push({ run: run.name, file: f, binary: true }); continue; }
      found.push({ run: run.name, file: f, text: readFileSync(join(runDir, f), 'utf8').trimEnd() });
    }
  }
  return found;
}

/* ── 도구 구현 ───────────────────────────────────────────────────── */

const stageEnum = { type: 'string', enum: STAGE_IDS, description: '스텝 라벨 (예: E1, D3, A1)' };

const TOOLS = [
  {
    name: 'list_stages',
    description:
      '디자인씽킹 파이프라인의 11개 스텝을 순서대로 반환한다. 각 스텝의 라벨·단계·입력·출력과, 사람이 반드시 개입해야 하는 지점을 함께 알려준다. 워크숍을 시작하기 전에 이것부터 호출해 전체 흐름을 파악할 것.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_pipeline_overview',
    description:
      '파이프라인 전체 방법론(단계 구조, 단계 간 데이터 전달 규칙, 이미지 스텝 처리, 산출물 저장 규칙)을 반환한다. 여러 스텝을 이어서 실행하는 오케스트레이터 역할을 맡을 때 필요하다.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_stage_guide',
    description:
      '특정 스텝의 작업 지침 전문(역할·임무·출력 양식·핵심 규칙)을 반환한다. 이 지침대로 산출물을 직접 작성하면 된다. 지침에 명시된 입력이 없으면 산출물을 지어내지 말고 누락을 보고할 것.',
    inputSchema: {
      type: 'object',
      properties: { stage: stageEnum },
      required: ['stage'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_stage_example',
    description:
      '해당 스텝의 실제 완성 산출물 예시를 반환한다(반려동물 저축 앱 프로젝트 사례). 출력 형식과 상세 수준을 맞추는 데 쓴다. 예시의 주제·내용을 현재 프로젝트에 복사하지 말 것 — 형식만 참고한다.',
    inputSchema: {
      type: 'object',
      properties: { stage: stageEnum },
      required: ['stage'],
      additionalProperties: false,
    },
  },
];

function renderStageList() {
  const lines = ['# 디자인씽킹 파이프라인 — 11개 스텝', ''];
  let phase = null;
  for (const s of STAGES) {
    if (s.phase !== phase) { phase = s.phase; lines.push(`## ${phase}`); }
    lines.push(`- **[${s.id}] ${s.title}**${s.image ? ' (이미지 생성 스텝)' : ''}`);
    lines.push(`  - 입력: ${s.input}`);
    lines.push(`  - 출력: ${s.output}`);
    if (s.note) lines.push(`  - 주의: ${s.note}`);
    if (s.humanGateAfter) lines.push(`  - ⛔ 이 스텝 다음에 **사람의 개입 필요** — ${s.humanGateAfter}`);
  }
  lines.push('', '---', '',
    '전체를 순차 실행할 때는 각 스텝의 출력을 **요약하지 말고 그대로** 다음 스텝 입력에 넣는다.',
    '상세 규칙은 `get_pipeline_overview`, 각 스텝 지침은 `get_stage_guide` 로 확인할 것.');
  return lines.join('\n');
}

function renderStageGuide(id) {
  const s = byId[id];
  const meta = [
    `# [${s.id}] ${s.title}`,
    `단계: ${s.phase} · 입력: ${s.input} · 출력: ${s.output}`,
    s.note ? `주의: ${s.note}` : null,
    s.humanGateAfter ? `⛔ 이 스텝 다음에 사람의 개입 필요 — ${s.humanGateAfter}` : null,
  ].filter(line => line !== null);
  return `${meta.join('\n')}\n\n---\n\n${readAgentBody(s)}`;
}

function renderStageExample(id) {
  const found = findExamples(id);
  if (!found.length) return `[${id}] 스텝의 예시 산출물이 저장돼 있지 않습니다.`;
  const parts = [`# [${id}] ${byId[id].title} — 실제 산출물 예시`, '',
    '> 형식과 상세 수준만 참고하십시오. 예시의 주제·내용을 현재 프로젝트로 옮기지 마십시오.', ''];
  for (const f of found) {
    parts.push(`## ${f.file}  \`(${f.run})\``, '');
    parts.push(f.binary ? '_(이미지 파일 — 저장소에서 직접 확인)_' : f.text, '');
  }
  return parts.join('\n');
}

function callTool(name, args = {}) {
  switch (name) {
    case 'list_stages': return renderStageList();
    case 'get_pipeline_overview': {
      if (!existsSync(SKILL_FILE)) throw new Error('SKILL.md 를 찾을 수 없습니다.');
      return stripFrontmatter(readFileSync(SKILL_FILE, 'utf8')).trimEnd();
    }
    case 'get_stage_guide':
    case 'get_stage_example': {
      const stage = String(args.stage ?? '').toUpperCase();
      if (!byId[stage]) throw new Error(`알 수 없는 스텝: "${args.stage}". 가능한 값: ${STAGE_IDS.join(', ')}`);
      return name === 'get_stage_guide' ? renderStageGuide(stage) : renderStageExample(stage);
    }
    default: throw new Error(`알 수 없는 도구: ${name}`);
  }
}

/* ── JSON-RPC over stdio ─────────────────────────────────────────── */

const send = msg => process.stdout.write(JSON.stringify(msg) + '\n');
const ok = (id, result) => send({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });

function handle(msg) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  try {
    switch (method) {
      case 'initialize': {
        const asked = params?.protocolVersion;
        return ok(id, {
          protocolVersion: SUPPORTED_PROTOCOLS.includes(asked) ? asked : DEFAULT_PROTOCOL,
          capabilities: { tools: {} },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        });
      }
      case 'notifications/initialized':
      case 'notifications/cancelled':
        return;
      case 'ping':
        return ok(id, {});
      case 'tools/list':
        return ok(id, { tools: TOOLS });
      case 'tools/call': {
        const toolName = params?.name;
        try {
          const text = callTool(toolName, params?.arguments ?? {});
          return ok(id, { content: [{ type: 'text', text }] });
        } catch (e) {
          // 도구 실행 오류는 프로토콜 오류가 아니라 결과로 돌려준다 (모델이 스스로 고칠 수 있도록)
          return ok(id, { content: [{ type: 'text', text: `오류: ${e.message}` }], isError: true });
        }
      }
      default:
        if (isNotification) return;
        return fail(id, -32601, `지원하지 않는 메서드: ${method}`);
    }
  } catch (e) {
    if (!isNotification) fail(id, -32603, e.message);
  }
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); }
    catch { fail(null, -32700, 'JSON 파싱 실패'); continue; }
    handle(msg);
  }
});
process.stdin.on('end', () => process.exit(0));
