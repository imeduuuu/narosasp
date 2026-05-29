#!/bin/bash

for file in *.html; do
  [ "$file" = "index.html" ] && continue  # Ya tiene OG tags
  
  # Extraer datos
  title=$(grep -oP '<title>\K[^<]+' "$file" | head -1)
  desc=$(grep -oP 'name="description" content="\K[^"]+' "$file" | head -1)
  canonical=$(grep -oP 'href="\K[^"]*narosasp[^"]*' "$file" | head -1)
  
  [ -z "$title" ] && continue
  [ -z "$desc" ] && continue
  
  # Si no tiene canonical, créalo
  if [ -z "$canonical" ]; then
    url_path="${file%.html}"
    canonical="https://narosasp.com/$file"
  fi
  
  # Crear tags OG
  og_tags="  <!-- Open Graph -->
  <meta property=\"og:type\" content=\"website\" />
  <meta property=\"og:url\" content=\"$canonical\" />
  <meta property=\"og:title\" content=\"$title\" />
  <meta property=\"og:description\" content=\"$desc\" />
  <meta property=\"og:image\" content=\"https://narosasp.com/assets/img/kids.jpg\" />
  <meta property=\"og:locale\" content=\"es_ES\" />"
  
  # Buscar dónde insertar (después de canonical o description)
  if grep -q '<link rel="canonical"' "$file"; then
    # Insertar después de canonical
    sed -i '' "/<link rel=\"canonical\"/a\\
$og_tags
" "$file"
  else
    # Insertar después de description
    sed -i '' "/<meta name=\"description\"/a\\
$og_tags
" "$file"
  fi
  
  echo "✅ $file"
done
