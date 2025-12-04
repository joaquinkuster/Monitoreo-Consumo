# Instrucciones para Ejecutar la Documentación

Para acceder a la documentación del Trabajo Final PyLP de forma interactiva a través del sistema de Monitoreo y Consumo, ir a https://github.com/joaquinkuster/Monitoreo-Consumo, descargarse el proyecto y seguir las siguientes instrucciones:

1.  **Abrir terminal** en la carpeta `docs`:
    ```bash
    cd docs
    ```

2.  **Instalar dependencias** (solo es necesario la primera vez):
    ```bash
    npm install
    ```

3.  **Ejecutar el servidor local**:
    ```bash
    npm run docs:dev
    ```

4.  **Ver en el navegador**:
    Ingresa a la dirección que se muestra en la terminal (usualmente `http://localhost:5173`).

---

**Opcional: Generar PDF**
Para exportar toda la documentación a un archivo PDF, ejecuta:
```bash
npm run docs:pdf
```
El archivo se generará en la carpeta `docs`.
