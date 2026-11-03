# Pruebas de Library API con Playwright

Suite de pruebas funcionales e integradas para `https://rahulshettyacademy.com/Library`, implementada con TypeScript y Playwright Test. Se utiliza `APIRequestContext` para probar directamente los endpoints REST, sin depender de una interfaz web.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
npm install
```

## Configuración

La URL base predeterminada es `https://rahulshettyacademy.com/Library`. Para apuntar la suite a otro entorno, define `LIBRARY_API_BASE_URL`; también puedes copiar `.env.example` como referencia. Playwright no carga archivos `.env` automáticamente, por lo que la variable debe estar definida en la terminal o por la herramienta de CI.

PowerShell:

```powershell
$env:LIBRARY_API_BASE_URL = "https://rahulshettyacademy.com/Library"
```

## Ejecución

```bash
npm test
npm run test:functional
npm run test:integration
npm run test:report
```

Los reportes HTML y JSON se generan en `playwright-report/` y `test-results/results.json`.

## Cobertura

| Endpoint | Validaciones |
| --- | --- |
| `POST /Addbook.php` | HTTP 200, claves y tipos de respuesta, mensaje, `ID = isbn + aisle`, duración menor a 500 ms y rechazo HTTP 500 cuando `aisle` no es numérico |
| `GET /GetBook.php` | Consulta existente, arreglo y tipos/campos del libro, duración menor a 500 ms, y HTTP 404 con mensaje esperado para ID inexistente |
| `POST /DeleteBook.php` | Eliminación, claves y tipos de respuesta, mensaje, duración menor a 500 ms, y HTTP 404 con mensaje esperado para ID inexistente |
| Flujo integrado | Crea dos libros, consulta ambos, elimina ambos y comprueba que las consultas posteriores devuelvan HTTP 404 |

Las mediciones de latencia incluyen el tiempo de ida y vuelta de cada solicitud desde el proceso de pruebas, no solo el tiempo de procesamiento del servidor. Se hace una solicitud de calentamiento antes de la primera medición de cada contexto para no contar el establecimiento inicial de la conexión TLS.

## Datos dinámicos y limpieza

Cada libro usa un valor numérico generado a partir de la hora y un componente aleatorio para `isbn` y `aisle`. Por eso, el `ID` esperado se calcula en ejecución como la concatenación de ambos y los casos paralelos no dependen de datos persistidos previamente. Las pruebas que crean libros funcionales los eliminan al terminar, incluso si una aserción falla; el flujo CRUD también intenta limpiar todos los IDs creados.

## Estructura

```text
.
├── tests/
│   ├── functional/
│   │   ├── add-book.spec.ts
│   │   ├── delete-book.spec.ts
│   │   └── get-book.spec.ts
│   ├── integration/
│   │   └── library-crud.spec.ts
│   └── support/
│       └── library-api.ts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```
