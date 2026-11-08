# VHS Tape configuration for FrontScout Demo GIF
# Documentation & install: https://github.com/charmbracelet/vhs

Output assets/demo.gif

Set FontSize 14
Set Width 960
Set Height 620
Set Padding 20
Set Theme "Catppuccin Mocha"
Set WindowBar Colorful

Type "npm run audit tests/test-overflow.html"
Sleep 600ms
Enter

# Wait for Playwright & Gemini Vision analysis to complete
Sleep 8s

# Pause on output summary for viewer to read
Sleep 4s

