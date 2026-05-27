param(
  [string]$PortableRoot = "F:\comfyuiAutoInstallerFLUX_v41\ComfyUI_windows_portable"
)

$ErrorActionPreference = "Stop"

$python = Join-Path $PortableRoot "python_embeded\python.exe"
$comfyRoot = Join-Path $PortableRoot "ComfyUI"
$sitePackages = Join-Path $PortableRoot "python_embeded\Lib\site-packages"

if (!(Test-Path -LiteralPath $python)) {
  throw "Embedded Python was not found at $python"
}

if (!(Test-Path -LiteralPath $comfyRoot)) {
  throw "ComfyUI root was not found at $comfyRoot"
}

Write-Host "Repairing ComfyUI embedded Python at $PortableRoot"

Get-Process python -ErrorAction SilentlyContinue |
  Where-Object { $_.Path -like "$PortableRoot*" } |
  ForEach-Object {
    Write-Host "Stopping embedded Python process $($_.Id)"
    Stop-Process -Id $_.Id -Force
  }

$numpyArtifacts = @(
  "numpy",
  "numpy.libs",
  "numpy-*.dist-info"
)

foreach ($artifact in $numpyArtifacts) {
  Get-ChildItem -LiteralPath $sitePackages -Filter $artifact -Force -ErrorAction SilentlyContinue |
    ForEach-Object {
      $resolved = Resolve-Path -LiteralPath $_.FullName
      if ($resolved.Path -notlike "$sitePackages*") {
        throw "Refusing to remove path outside site-packages: $($resolved.Path)"
      }
      Write-Host "Removing stale artifact $($resolved.Path)"
      Remove-Item -LiteralPath $resolved.Path -Recurse -Force
    }
}

& $python -m pip install numpy==1.26.4 --force-reinstall
& $python -m pip install insightface==0.7.3 --no-deps --force-reinstall
& $python -m pip install onnxruntime-gpu --upgrade
& $python -m pip install huggingface-hub==0.33.4
& $python -m pip install urllib3==1.26.20

Push-Location $comfyRoot
try {
  foreach ($cache in @("temp", "__pycache__", ".cache")) {
    $target = Join-Path $comfyRoot $cache
    if (Test-Path -LiteralPath $target) {
      $resolved = Resolve-Path -LiteralPath $target
      if ($resolved.Path -notlike "$comfyRoot*") {
        throw "Refusing to remove cache outside ComfyUI root: $($resolved.Path)"
      }
      Write-Host "Clearing cache $($resolved.Path)"
      Remove-Item -LiteralPath $resolved.Path -Recurse -Force
    }
  }
}
finally {
  Pop-Location
}

& $python -m pip check
& $python -c "import numpy, insightface, onnxruntime, huggingface_hub, urllib3; print('numpy', numpy.__version__); print('insightface', insightface.__version__); print('ort', onnxruntime.__version__); print('hf', huggingface_hub.__version__); print('urllib3', urllib3.__version__); print('providers', onnxruntime.get_available_providers())"

Write-Host "ComfyUI repair complete. Restart ComfyUI after this script finishes."
