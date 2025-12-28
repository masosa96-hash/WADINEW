# Kivo Backend Setup

## Configuración Local

1. Copiar `.env.example` a `.env`
2. Agregar `OPENAI_API_KEY`
3. `npm install`
4. `npm start`

## Testear Backend

```bash
curl -X POST http://localhost:3000/kivo/message \
  -H "Content-Type: application/json" \
  -d '{"mensajeUsuario": "Hola Kivo", "personalidad": "barrio"}'
```

## Personalidades

- normal
- barrio
- tecnico
- reflexivo

## Deploy

El proyecto está configurado para desplegarse automáticamente en Railway al hacer push a la rama principal.
