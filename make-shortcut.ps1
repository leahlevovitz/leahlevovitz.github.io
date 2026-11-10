# יוצר קיצור דרך בשולחן העבודה לאתר הפרויקטים (וגם קיצור מקלדת Ctrl+Alt+P)
# להרצה מחדש אם מעבירים את התיקייה:  לחיצה ימנית > Run with PowerShell
$ErrorActionPreference = 'Stop'
$here  = Split-Path -Parent $MyInvocation.MyCommand.Path
$index = Join-Path $here 'index.html'
$ico   = Join-Path $here 'img\icon.ico'
$png   = Join-Path $here 'img\icon.png'

# --- icon ---
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
$rect = New-Object System.Drawing.Rectangle 8, 8, 240, 240
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(123,92,255)), ([System.Drawing.Color]::FromArgb(34,193,195)), 45
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 60; $path.AddArc(8,8,$r,$r,180,90); $path.AddArc(248-$r,8,$r,$r,270,90); $path.AddArc(248-$r,248-$r,$r,$r,0,90); $path.AddArc(8,248-$r,$r,$r,90,90); $path.CloseFigure()
$g.FillPath($brush, $path)
$font = New-Object System.Drawing.Font 'Segoe UI', 104, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat; $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
$g.DrawString('</>', $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 0, 4, 256, 256), $sf)
$g.Dispose()
$bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)

# PNG-in-ICO (supported by Windows Vista+)
$pngBytes = [IO.File]::ReadAllBytes($png)
$ms = New-Object IO.MemoryStream; $w = New-Object IO.BinaryWriter $ms
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]1)
$w.Write([byte]0); $w.Write([byte]0); $w.Write([byte]0); $w.Write([byte]0)
$w.Write([UInt16]1); $w.Write([UInt16]32); $w.Write([UInt32]$pngBytes.Length); $w.Write([UInt32]22)
$w.Write($pngBytes); $w.Flush()
[IO.File]::WriteAllBytes($ico, $ms.ToArray())
$bmp.Dispose()

# --- shortcut ---
$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop 'הפרויקטים שלי.lnk'
$sh = New-Object -ComObject WScript.Shell
$lnk = $sh.CreateShortcut($lnkPath)
$lnk.TargetPath = $index
$lnk.WorkingDirectory = $here
$lnk.IconLocation = "$ico,0"
$lnk.Hotkey = 'CTRL+ALT+P'
$lnk.Description = 'אתר הפרויקטים שלי'
$lnk.Save()
Write-Host "Shortcut created: $lnkPath  (hotkey Ctrl+Alt+P)"
