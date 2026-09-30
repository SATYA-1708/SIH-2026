$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
$deckPath = "c:\Users\Satya\Downloads\kabadiWala\final.pptx"
$pdfPath = "c:\Users\Satya\Downloads\kabadiWala\final.pdf"
$pres = $pptApp.Presentations.Open($deckPath, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$pres.SaveAs($pdfPath, 32)
$outDir = "c:\Users\Satya\Downloads\kabadiWala\final_previews"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $slidePath = "$outDir\slide_$i.png"
    $pres.Slides.Item($i).Export($slidePath, "PNG", 1920, 1080)
}
$pres.Close()
$pptApp.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pptApp) | Out-Null
Write-Host "Export completed successfully!"
