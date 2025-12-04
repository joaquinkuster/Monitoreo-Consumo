#!/bin/bash

# Script de verificación pre-despliegue para Netlify
# Este script verifica que todo esté listo para desplegar en Netlify

echo "🔍 Verificando configuración para Netlify..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde la carpeta 'docs'"
    exit 1
fi

echo "✅ Directorio correcto"

# Verificar que existe netlify.toml
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: No se encuentra netlify.toml"
    exit 1
fi

echo "✅ Archivo netlify.toml encontrado"

# Verificar que existen las dependencias
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules no encontrado. Instalando dependencias..."
    npm install
else
    echo "✅ Dependencias instaladas"
fi

# Intentar construir la documentación
echo ""
echo "🔨 Construyendo documentación..."
npm run docs:build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build exitoso!"
    echo ""
    echo "📊 Verificando archivos generados..."
    
    if [ -d ".vitepress/dist" ]; then
        FILE_COUNT=$(find .vitepress/dist -type f | wc -l)
        echo "✅ Directorio de build generado con $FILE_COUNT archivos"
    else
        echo "❌ Error: No se generó el directorio .vitepress/dist"
        exit 1
    fi
    
    echo ""
    echo "🎉 ¡Todo listo para desplegar en Netlify!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Sube tu código a GitHub"
    echo "2. Ve a https://app.netlify.com/"
    echo "3. Conecta tu repositorio"
    echo "4. Netlify detectará automáticamente la configuración"
    echo ""
    echo "O usa Netlify CLI:"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  netlify deploy --prod"
    
else
    echo ""
    echo "❌ Error en el build. Revisa los errores arriba."
    exit 1
fi
