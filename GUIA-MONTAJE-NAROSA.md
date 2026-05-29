# 🎈 Guía de montaje DIY — Automatización Narosa Sweet Party

> Paso a paso para montar **tú misma** todo el sistema, sin pagar a nadie por la instalación.
> Punto de partida: ya tienes **Shopify (de pago)** y el **dominio narosasp.com**.
> Ritmo realista: **4 semanas**, ~1-2 h al día. Coste de herramientas: **≈ 22 €/mes** (+ publicidad opcional).

---

## 🧰 Antes de empezar — cuentas que necesitas (Día 0)

Crea estas cuentas (todas con plan gratis o pago por uso). Apunta cada usuario/contraseña en un gestor (Bitwarden, gratis):

| Servicio | Para qué | Coste |
|----------|----------|-------|
| **DigitalOcean** | El servidor donde vive todo | 6 €/mes |
| **Anthropic (Claude)** | La IA que responde y cualifica | pago por uso (~13 €/mes) |
| **Meta for Developers** | WhatsApp Business API + Instagram | gratis (consumo aparte) |
| **Cuenta de empresa en Facebook** | Verificar el negocio para WhatsApp | gratis |
| **Resend** | Enviar emails (presupuestos) | gratis hasta 3.000/mes |
| **Bitwarden** | Guardar todas las claves seguras | gratis |

🔑 **Prioridad nº1:** abre la **verificación de empresa en Meta** el primer día — es lo que más tarda (puede pedir documentación y tardar días). Mientras tramita, avanzas con lo demás.

---

## 📅 SEMANA 1 — Cimientos (servidor + n8n)

**Objetivo:** tener el "cerebro" encendido 24/7 con su panel web seguro (https).

### Día 1 · El servidor
1. En DigitalOcean → **Create Droplet**.
2. Elige: **Ubuntu 24.04 LTS**, plan básico **Regular 1 GB / 6 $/mes**, región **Frankfurt o Ámsterdam** (cerca de España).
3. Autenticación por **contraseña** (más fácil para empezar) o clave SSH.
4. Apunta la **IP** del droplet.
5. Conéctate: en tu Mac, Terminal → `ssh root@TU_IP`.

### Día 2 · Preparar el servidor
1. Actualizar: `apt update && apt upgrade -y`
2. Instalar Docker (la forma más limpia de correr n8n):
   ```
   curl -fsSL https://get.docker.com | sh
   ```
3. Instalar Docker Compose: `apt install docker-compose-plugin -y`
4. Crear 2 GB de swap (evita caídas por falta de RAM):
   ```
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

### Día 3 · Dominio + n8n
1. En tu proveedor del dominio, crea un registro **A**: `n8n.narosasp.com → TU_IP`.
2. Levanta n8n con SSL automático usando Docker Compose (n8n + Caddy o Traefik para https). Plantilla oficial: buscar "n8n docker-compose traefik letsencrypt".
3. Entra a `https://n8n.narosasp.com`, crea tu usuario admin.

✅ **Fin de semana 1:** n8n accesible por https, encendido siempre.

---

## 📅 SEMANA 2 — WhatsApp (el canal nº1)

**Objetivo:** que un mensaje de WhatsApp llegue a n8n y reciba respuesta automática.

### Día 1-2 · WhatsApp Business API
1. En **Meta for Developers** → crea una App tipo **Business**.
2. Añade el producto **WhatsApp**.
3. Conecta un **número de teléfono** dedicado (uno nuevo, o el de la tienda si no lo usas en la app normal de WhatsApp).
4. Consigue el **token** y el **Phone Number ID**.

### Día 3 · Conectar con n8n
1. En n8n, crea un **Webhook** (URL que Meta llamará al llegar un mensaje).
2. En Meta → WhatsApp → Configuration → pega esa URL como **Callback** y suscríbete a `messages`.
3. Prueba: manda un WhatsApp al número → debe aparecer en n8n.

### Día 4 · Primera respuesta automática
1. En el flujo de n8n, tras el webhook, añade un nodo **HTTP Request** que llame a la API de WhatsApp y responda "¡Hola! 🎈 Soy el asistente de Narosa…".
2. Prueba el ida y vuelta completo.

✅ **Fin de semana 2:** WhatsApp responde solo (aún sin IA, respuesta fija).

---

## 📅 SEMANA 3 — La inteligencia (Claude)

**Objetivo:** que la IA converse, entienda qué fiesta quiere el cliente y lo cualifique.

### Día 1 · Claude API
1. En **Anthropic Console** → crea una **API key**.
2. ⚠️ **Pon un límite de gasto** (Billing → límite mensual, ej. 20 €) para no llevarte sustos.

### Día 2-3 · El prompt de Narosa
1. Escribe el "carácter" del asistente: cálido, cercano, experto en fiestas infantiles, que pregunte tipo de fiesta, fecha, nº de niños y presupuesto.
2. En n8n, entre el webhook y la respuesta, añade un nodo **HTTP Request a Claude** (`api.anthropic.com/v1/messages`) pasando el mensaje del cliente + el historial.
3. Devuelve la respuesta de Claude por WhatsApp.

### Día 4 · Memoria y cualificación
1. Instala **Redis** (otro contenedor Docker) para recordar la conversación de cada cliente.
2. Pide a Claude que, al final, devuelva un **resumen + puntuación de interés** (0-100) y lo guarde.

### Día 5 · Guardar los leads
1. Guarda cada solicitud (nombre, fiesta, presupuesto, score) en una hoja de Google Sheets o una base simple → será lo que alimente el **Dashboard**.

✅ **Fin de semana 3:** la IA conversa, cualifica y registra cada lead.

---

## 📅 SEMANA 4 — Remate (Instagram + dashboard + pruebas)

### Día 1-2 · Instagram automático
1. En la misma App de Meta, añade **Instagram Graph API**.
2. Flujo en n8n para responder DMs/comentarios igual que WhatsApp.
3. (Opcional) Programación de posts con un calendario.

### Día 3 · Conectar Shopify
1. En Shopify → Settings → Apps → **Develop apps** → crea una app privada con permisos de productos/pedidos.
2. Úsala para que el bot consulte packs/precios reales al dar presupuestos.

### Día 4 · Dashboard
1. Sube las páginas del portfolio (incluye `dashboard.html`) a un hosting estático o al propio servidor.
2. Conecta el dashboard a la fuente de leads de la semana 3.

### Día 5 · Pruebas reales (¡no saltarse!)
1. Haz **5 conversaciones de prueba** tú misma simulando clientes distintos.
2. Revisa: ¿responde bien? ¿cualifica? ¿llega el email? ¿aparece en el dashboard?
3. Solo cuando las 5 salgan bien, anuncia el WhatsApp al público.

✅ **Fin de semana 4:** sistema completo en producción.

---

## 🚦 Prioridades si vas justa de tiempo

1. **🔴 Imprescindible:** Servidor + n8n + WhatsApp + Claude (semanas 1-3). Con esto ya respondes y cualificas 24/7.
2. **🟡 Importante:** Guardar leads + dashboard (ver lo que entra).
3. **🟢 Mejora:** Instagram automático, programación de posts, conexión Shopify de precios.

---

## 💸 Recordatorio de costes (todo DIY)

| Concepto | Coste |
|----------|-------|
| Shopify + dominio | **0 € extra** (ya los pagas) |
| Servidor + n8n + Redis + SSL + email | **≈ 6 €/mes** |
| Claude API | **≈ 13 €/mes** |
| WhatsApp API (Meta) | **≈ 3 €/mes** (1.000 conv. gratis) |
| **Total funcionamiento** | **≈ 22 €/mes** |
| Publicidad Meta Ads + Google Ads | **opcional · 90-270 €/mes** (tú decides) |
| Montaje | **0 €** (tu tiempo, esta guía) |

---

## ⚠️ Consejos para no tropezar

- **Límite de gasto en Claude SIEMPRE** (Billing → cap mensual). Es el único que puede dispararse si hay mucho tráfico.
- **Haz backup** del servidor cada semana (DigitalOcean Snapshots, ~1 €/mes opcional).
- **No publiques el WhatsApp** hasta tener las 5 pruebas OK.
- **WhatsApp tiene reglas anti-spam**: responde solo a quien te escribe primero; no mandes mensajes masivos en frío.
- Si te atascas, cada herramienta (n8n, Meta, Anthropic) tiene documentación y comunidad gratis.

---

*Guía generada 2026-05-29 para el proyecto Narosa Sweet Party (narosasp.com). Costes orientativos a esa fecha; pueden variar.*
