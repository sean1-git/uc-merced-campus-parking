# Use an installed Python, or the bundled runtime available on this computer.
$parkingPython = $null
foreach ($parkingCandidate in @('py', 'python')) {
    $parkingCommand = Get-Command $parkingCandidate -ErrorAction SilentlyContinue
    if ($parkingCommand -and $parkingCommand.Source -notlike '*\WindowsApps\*') {
        $parkingPython = $parkingCommand.Source
        break
    }
}
if (-not $parkingPython) {
    $parkingBundled = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
    if (Test-Path -LiteralPath $parkingBundled) { $parkingPython = $parkingBundled }
}
if (-not $parkingPython) { throw 'Python 3.10+ is required. Install Python, then run python app.py.' }
& $parkingPython (Join-Path $PSScriptRoot 'app.py') @args
