#requires -Version 5.0
# PreToolUse hook: Bash 호출 중 `git commit` 포함 시 npm run build 강제 실행
# 빌드 실패 → permissionDecision=deny 로 차단

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

$cmd = $json.tool_input.command
if (-not $cmd) { exit 0 }

# git commit이 아니면 즉시 통과
if ($cmd -notmatch 'git\s+commit') {
    exit 0
}

Write-Host "[hook] git commit 감지 - npm run build 검증 중..."

$buildOutput = & npm run build 2>&1 | Out-String
$buildExit = $LASTEXITCODE

if ($buildExit -eq 0) {
    Write-Host "[hook] build OK - commit 진행"
    exit 0
}

# 빌드 실패: 마지막 800자만 잘라서 사유로 전달
if ($buildOutput.Length -gt 800) {
    $snippet = $buildOutput.Substring($buildOutput.Length - 800)
} else {
    $snippet = $buildOutput
}

$result = [PSCustomObject]@{
    hookSpecificOutput = [PSCustomObject]@{
        hookEventName = "PreToolUse"
        permissionDecision = "deny"
        permissionDecisionReason = "npm run build 실패로 commit 차단됨. 빌드 에러를 먼저 해결해주세요:`n`n$snippet"
    }
}

$result | ConvertTo-Json -Depth 5 -Compress
exit 0
