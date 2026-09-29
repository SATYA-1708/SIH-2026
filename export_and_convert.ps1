$ppt = New-Object -ComObject PowerPoint.Application
$fpath = (Get-Location).Path + "\SIH2026_Idea_Presentation_E-Waste_Setu.pptx"
$pdfpath = (Get-Location).Path + "\SIH2026_Idea_Presentation_E-Waste_Setu.pdf"
$pres = $ppt.Presentations.Open($fpath)

# Export PDF (32 = ppSaveAsPDF)
$pres.SaveAs($pdfpath, 32)
Write-Host "Exported PDF successfully!"

# Export slide images
New-Item -ItemType Directory -Force -Path "slide_previews" | Out-Null
for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $out = (Get-Location).Path + "\slide_previews\slide_" + $i + ".png"
    $pres.Slides.Item($i).Export($out, "PNG", 1920, 1080)
}
$pres.Close()
$ppt.Quit()
Write-Host "Exported all slide previews successfully!"
