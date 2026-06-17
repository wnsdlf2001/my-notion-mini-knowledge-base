#requires -Version 5.0
# Stop hook: Claude 응답 종료 시 tsc --noEmit 실행
# 에러 있으면 systemMessage + decision=block으로 Claude에게 피드백

$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

# stdin은 사용하지 않지만 비워둠
$null = [Console]::In.ReadToEnd()

$output = & npx --no-install tsc --noEmit 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    exit 0
}

# 너무 길면 자름 (1500자 cap)
if ($output.Length -gt 1500) {
    $snippet = $output.Substring(0, 1500) + "`n... (truncated)"
} else {
    $snippet = $output
}

$result = [PSCustomObject]@{
    systemMessage = "TypeScript 에러가 감지되었습니다 (tsc --noEmit 실패)"
    decision = "block"
    reason = "다음 타입 에러를 수정해주세요:`n`n$snippet"
}

$result | ConvertTo-Json -Compress
exit 0
