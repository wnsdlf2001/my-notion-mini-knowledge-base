#requires -Version 5.0
# PostToolUse hook: Edit/Write로 변경된 ts/tsx/js/jsx 파일을 ESLint --fix
# stdin: {"tool_name":"Edit|Write","tool_input":{"file_path":"..."}, "tool_response":{...}}

$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }

try {
    $json = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$filePath = $json.tool_input.file_path
if (-not $filePath) { exit 0 }

if ($filePath -notmatch '\.(ts|tsx|js|jsx|mjs|cjs)$') {
    exit 0
}

# project root 기준으로 동작 (settings.json이 있는 디렉토리에서 호출됨)
& npx --no-install eslint --fix --no-error-on-unmatched-pattern $filePath 2>&1 | Out-Null

# 실패해도 후속 작업 차단하지 않음
exit 0
