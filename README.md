# DuoRating

Aplicación móvil para parejas que desean calificar películas y series juntos, mantener una lista compartida de contenido pendiente y llevar un historial de sus vistas.

---

## Características

- **Autenticación** - Registro e inicio de sesión con email/contraseña
- **Vinculación de pareja** - Sistema de códigos para conectar cuentas
- **Búsqueda de contenido** - Integración con TMDB para encontrar películas y series
- **Sistema de puntuación** - Cada usuario califica independientemente (1-10)
- **Comentarios** - Opción de agregar reseñas personales
- **Lista de pendientes** - Contenido guardado para ver después
- **Historial** - Registro cronológico de todo lo calificado

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React Native + Expo + TypeScript |
| Estilos | NativeWind (Tailwind CSS para React Native) |
| Backend | Supabase (Auth + PostgreSQL) |
| API Externa | TMDB (The Movie Database) |
| Build & Deploy | EAS Build → Google Play Store |

---

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Cuenta de [Supabase](https://supabase.com/)
- API Key de [TMDB](https://www.themoviedb.org/documentation/api)

---

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/daniieldz/duorating.git
cd duorating
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar `.env` con tus credenciales:
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
EXPO_PUBLIC_TMDB_API_KEY=tu_api_key_de_tmdb
```

5. Iniciar el servidor de desarrollo:
```bash
npx expo start
```

---

## Desarrollo

### Comandos Principales

```bash
# Iniciar desarrollo
npx expo start

# Ejecutar en Android
npx expo start --android

# Ejecutar en web (pruebas rápidas)
npx expo start --web

# Limpiar caché
npx expo start --clear
```

### Estructura del Proyecto

```
duorating/
├── src/
│   ├── app/              # Pantallas (Expo Router)
│   ├── components/       # Componentes reutilizables
│   ├── lib/              # Configuración de servicios
│   ├── hooks/            # Hooks personalizados
│   ├── types/            # Definiciones TypeScript
│   └── utils/            # Funciones auxiliares
├── assets/               # Imágenes y recursos estáticos
└── eas.json              # Configuración de EAS Build
```

---

## Build y Deploy

### Generar APK (Pruebas)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Configurar proyecto
eas build:configure

# Generar APK
eas build --platform android --profile preview
```

### Publicar en Play Store

```bash
# Generar AAB para producción
eas build --platform android --profile production

# Subir a Play Store
eas submit --platform android
```

---

## Base de Datos

### Tablas en Supabase

| Tabla | Descripción |
|-------|-------------|
| `couples` | Almacena las parejas vinculadas |
| `ratings` | Puntuaciones y comentarios |
| `watchlist` | Lista de contenido pendiente |

Ver [PLAN.md](./PLAN.md) para el esquema completo.

---

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL de tu proyecto en Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `EXPO_PUBLIC_TMDB_API_KEY` | API Key de The Movie Database |

---

## Contribuir

1. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Hacer commit con convención (`git commit -m 'feat: agregar nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Abrir un Pull Request

---

## Licencia

MIT

---

## Contacto

- **Nombre del Proyecto**: DuoRating
- **Repositorio**: [GitHub](https://github.com/DaniielDz/duorating)
