# 🚀 Guía de Despliegue en Netlify

Esta guía te ayudará a desplegar la documentación del sistema de Monitoreo de Consumo Eléctrico en Netlify.

## 📋 Requisitos Previos

- [x] Cuenta en [Netlify](https://www.netlify.com/) (gratis)
- [x] Repositorio en GitHub con el código
- [x] Archivo `netlify.toml` configurado (✅ ya incluido)

---

## 🎯 Opción 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Subir el código a GitHub

Si aún no lo has hecho, sube tu proyecto a GitHub:

```bash
# Inicializar repositorio (si no existe)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Documentación lista para despliegue"

# Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/Monitoreo-Consumo.git

# Subir a GitHub
git push -u origin main
```

### Paso 2: Conectar Netlify con GitHub

1. **Ir a Netlify**: Accede a [https://app.netlify.com/](https://app.netlify.com/)

2. **Crear cuenta o iniciar sesión**:
   - Puedes usar tu cuenta de GitHub para login directo
   - Click en "Sign up" o "Log in"

3. **Importar proyecto**:
   - Click en **"Add new site"** → **"Import an existing project"**
   - Selecciona **"Deploy with GitHub"**
   - Autoriza a Netlify para acceder a tus repositorios

4. **Seleccionar repositorio**:
   - Busca y selecciona `Monitoreo-Consumo`
   - Click en el repositorio

5. **Configurar build** (Netlify detectará automáticamente `netlify.toml`):
   - **Base directory**: `docs`
   - **Build command**: `npm run docs:build`
   - **Publish directory**: `docs/.vitepress/dist`
   - Click en **"Deploy site"**

6. **Esperar el despliegue**:
   - Netlify construirá tu sitio automáticamente
   - Verás el progreso en tiempo real
   - Toma aproximadamente 2-3 minutos

7. **¡Listo!** 🎉
   - Tu sitio estará disponible en: `https://random-name-123456.netlify.app`
   - Puedes cambiar el nombre del sitio en: **Site settings** → **Change site name**

---

## 🎯 Opción 2: Despliegue Manual (Drag & Drop)

Si prefieres no conectar GitHub:

### Paso 1: Construir la documentación localmente

```bash
# Navegar a la carpeta docs
cd docs

# Instalar dependencias (si no lo has hecho)
npm install

# Construir la documentación
npm run docs:build
```

Esto generará la carpeta `.vitepress/dist` con todos los archivos estáticos.

### Paso 2: Desplegar en Netlify

1. Ve a [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `docs/.vitepress/dist` al navegador
3. ¡Listo! Tu sitio estará desplegado instantáneamente

> **⚠️ Nota**: Con esta opción, tendrás que volver a subir manualmente cada vez que hagas cambios.

---

## 🔧 Configuración Adicional

### Cambiar el nombre del sitio

1. En Netlify, ve a **Site settings**
2. Click en **Change site name**
3. Elige un nombre único, por ejemplo: `monitoreo-consumo-docs`
4. Tu URL será: `https://monitoreo-consumo-docs.netlify.app`

### Configurar dominio personalizado (Opcional)

1. Ve a **Domain settings**
2. Click en **Add custom domain**
3. Sigue las instrucciones para configurar tu dominio

### Variables de entorno (si las necesitas)

1. Ve a **Site settings** → **Environment variables**
2. Agrega las variables necesarias

---

## 🔄 Actualizaciones Automáticas

Si usaste la **Opción 1** (GitHub):

- Cada vez que hagas `git push` a tu repositorio
- Netlify detectará los cambios automáticamente
- Reconstruirá y desplegará la nueva versión
- ¡Sin intervención manual!

```bash
# Hacer cambios en la documentación
# ...

# Subir cambios
git add .
git commit -m "Actualizar documentación"
git push

# Netlify desplegará automáticamente en ~2 minutos
```

---

## 📊 Monitoreo y Analytics

### Ver estadísticas de despliegue

1. En el dashboard de Netlify
2. Ve a **Deploys** para ver el historial
3. Click en cualquier deploy para ver logs detallados

### Habilitar Analytics (Opcional)

1. Ve a **Analytics** en el menú lateral
2. Netlify ofrece analytics básicos gratis
3. Para analytics avanzados, considera Google Analytics

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Problema**: El build falla en Netlify

**Solución**:
```bash
# Verificar que el build funcione localmente
cd docs
npm install
npm run docs:build

# Si funciona localmente, revisar los logs en Netlify
```

### Error: "Page not found" en rutas

**Problema**: Las rutas no funcionan correctamente

**Solución**: El archivo `netlify.toml` ya incluye las redirecciones necesarias. Verifica que esté en la raíz de `docs/`.

### Error: "Node version mismatch"

**Problema**: Versión de Node.js incompatible

**Solución**: El `netlify.toml` especifica Node 18. Si necesitas otra versión, edita:
```toml
[build.environment]
  NODE_VERSION = "20"  # Cambia según necesites
```

---

## ✅ Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Cuenta de Netlify creada
- [ ] Sitio conectado con GitHub
- [ ] Build exitoso
- [ ] Sitio accesible en la URL de Netlify
- [ ] Nombre del sitio personalizado (opcional)
- [ ] Dominio personalizado configurado (opcional)
- [ ] Verificar que todas las páginas funcionan
- [ ] Verificar que las imágenes se cargan
- [ ] Verificar que los gráficos de Mermaid funcionan
- [ ] Verificar que Font Awesome se carga correctamente

---

## 🎓 Recursos Adicionales

- [Documentación oficial de Netlify](https://docs.netlify.com/)
- [VitePress Deployment Guide](https://vitepress.dev/guide/deploy#netlify)
- [Netlify Community Forums](https://answers.netlify.com/)

---

## 📝 Notas Importantes

> [!IMPORTANT]
> El archivo `netlify.toml` ya está configurado con:
> - ✅ Comando de build optimizado
> - ✅ Directorio de publicación correcto
> - ✅ Redirecciones para SPA
> - ✅ Headers de seguridad
> - ✅ Cache optimizado para assets

> [!TIP]
> Para un despliegue más rápido, considera usar **Netlify CLI**:
> ```bash
> npm install -g netlify-cli
> netlify login
> netlify init
> netlify deploy --prod
> ```

> [!WARNING]
> No subas archivos sensibles como credenciales de Firebase al repositorio público. Usa variables de entorno en Netlify si necesitas configuraciones secretas.

---

## 🎉 ¡Felicitaciones!

Una vez desplegado, tu documentación estará disponible 24/7 en internet y podrás compartir el link con:
- 👨‍🏫 Profesores
- 👥 Compañeros de equipo
- 🌍 Cualquier persona interesada en tu proyecto

**URL de ejemplo**: `https://monitoreo-consumo-docs.netlify.app`
