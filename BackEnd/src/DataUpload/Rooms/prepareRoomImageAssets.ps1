$sourceRoot = Join-Path $PSScriptRoot 'assets\source'
$galleryRoot = Join-Path $PSScriptRoot 'assets\gallery'

Add-Type -AssemblyName System.Drawing

$variants = @(
  @{ X = 0.00; Y = 0.00; Width = 1.00; Height = 1.00 },
  @{ X = 0.00; Y = 0.04; Width = 0.92; Height = 0.90 },
  @{ X = 0.08; Y = 0.04; Width = 0.92; Height = 0.90 },
  @{ X = 0.04; Y = 0.00; Width = 0.92; Height = 0.92 },
  @{ X = 0.04; Y = 0.08; Width = 0.92; Height = 0.92 }
)

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' } |
  Select-Object -First 1
$encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
  [System.Drawing.Imaging.Encoder]::Quality,
  [long]88
)

Get-ChildItem -LiteralPath $sourceRoot -Filter '*.png' | ForEach-Object {
  $category = $_.BaseName.ToLowerInvariant()
  $categoryRoot = Join-Path $galleryRoot $category
  New-Item -ItemType Directory -Path $categoryRoot -Force | Out-Null

  $source = [System.Drawing.Image]::FromFile($_.FullName)
  try {
    for ($index = 0; $index -lt $variants.Count; $index++) {
      $variant = $variants[$index]
      $sourceRectangle = [System.Drawing.Rectangle]::new(
        [int]($source.Width * $variant.X),
        [int]($source.Height * $variant.Y),
        [int]($source.Width * $variant.Width),
        [int]($source.Height * $variant.Height)
      )
      $output = [System.Drawing.Bitmap]::new(1280, 800)

      try {
        $graphics = [System.Drawing.Graphics]::FromImage($output)
        try {
          $graphics.CompositingQuality =
            [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
          $graphics.InterpolationMode =
            [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.SmoothingMode =
            [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $graphics.DrawImage(
            $source,
            [System.Drawing.Rectangle]::new(0, 0, 1280, 800),
            $sourceRectangle,
            [System.Drawing.GraphicsUnit]::Pixel
          )
        } finally {
          $graphics.Dispose()
        }

        $destination = Join-Path $categoryRoot (
          '{0}-gallery-{1}.jpg' -f $category, ($index + 1)
        )
        $output.Save($destination, $jpegEncoder, $encoderParameters)
      } finally {
        $output.Dispose()
      }
    }
  } finally {
    $source.Dispose()
  }
}

$encoderParameters.Dispose()
