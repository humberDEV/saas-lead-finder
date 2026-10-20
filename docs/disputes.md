# Disputas y fraude en Huntly

## Activación antes de desplegar

1. En el entorno del servidor, configura `ADMIN_CLERK_USER_IDS` con el ID de usuario de Clerk de cada administrador, separado por comas si hay más de uno. No uses correos ni secretos en la URL. Si la variable falta, `/admin` y `/admin/disputes` responden como páginas inexistentes. El antiguo `?key=` ya no funciona.
2. Comprueba que la cuenta de Stripe dispone de notificaciones de disputas y de acceso al Dashboard para la persona que las gestionará. El panel de Huntly no concede acceso a Stripe.
   Opcionalmente, configura `DISPUTE_ALERT_EMAIL` y el `RESEND_API_KEY`/`EMAIL_FROM` ya usados por Huntly para recibir un aviso propio ante disputa o alerta temprana de fraude. No dependas solo de este correo: mantén las notificaciones de Stripe.
3. Comprueba que el endpoint de webhook de producción escucha `charge.dispute.created`, `charge.dispute.closed`, `radar.early_fraud_warning.created` y `checkout.session.async_payment_succeeded`, además de los eventos de facturación existentes. Verifica la firma del webhook con `STRIPE_WEBHOOK_SECRET`. El acceso de pago ya no se concede si Checkout se completó pero el pago sigue pendiente.
4. Revisa en Stripe Radar las reglas de riesgo y 3D Secure. Huntly deja la autenticación automática de Stripe; no fuerza un desafío a todos los compradores.
5. Revisa en Stripe el descriptor bancario y la configuración de recibos. El cliente debe reconocer el cargo. Publica términos claros de renovación, cancelación y reembolso antes de alegar que los aceptó; este cambio no crea ni presume esa política.

## Cuando llega una disputa

1. Abre `/admin/disputes` con el usuario de Clerk autorizado. Prioriza los casos `needs_response` y su fecha límite. Abre el expediente y el caso correspondiente en Stripe.
2. Examina el motivo: fraude/tarjeta robada, producto no recibido, suscripción cancelada, etc. No utilices el mismo argumento para todas las disputas.
3. Si procede, contacta al cliente y valora reembolso o aceptación. Un registro de uso de Huntly demuestra uso de la cuenta, **no** que el titular de la tarjeta autorizó la compra.
4. Reúne únicamente datos verificables: recibo y cargo de Stripe; resultado de 3D Secure y riesgo si constan; correo y cuenta de Huntly; inicio del checkout y uso posterior fechado; comunicación con el cliente; términos/cancelación que efectivamente se mostraron al comprar.
5. Responde manualmente en Stripe antes de la fecha límite. El panel de Huntly es de solo lectura: no sube pruebas ni envía respuestas automáticamente.

## Qué registra Huntly

- Checkout: ID de sesión, usuario de Clerk, cliente de Stripe, plan, importe y estado del pago al completarse.
- Uso: eventos de búsqueda con fecha, nicho/ciudad y número de resultados; historial de búsquedas; eventos de suscripción, facturación y disputas ya registrados.
- Pago: se consulta en directo a Stripe. Huntly **no** almacena el número de tarjeta ni el CVC; el panel muestra como máximo marca y últimos cuatro dígitos, si Stripe los proporciona.

El panel consulta una ventana desde 30 días antes del cargo; limita los eventos a 250 y las búsquedas a 100, con aviso si se llega al límite. No recoge direcciones IP nuevas ni huellas de dispositivo. Si en el futuro se decide hacerlo, definir antes base legal, retención, control de acceso y política de privacidad.

## Pruebas de sandbox recomendadas

- Pago con 3D Secure requerido y pago normal.
- Disputa simulada por fraude y disputa por producto no recibido. Confirma que aparecen en el panel y que el expediente vincula el cliente correcto.
- Usuario no autenticado, usuario autenticado no autorizado y usuario incluido en `ADMIN_CLERK_USER_IDS`.
- Comprueba que la URL antigua `/admin?key=...` no da acceso, y que no hay datos completos de tarjeta en la página ni en los eventos.

## Fuentes de Stripe

- [Evaluación de riesgo y Radar](https://docs.stripe.com/radar/risk-evaluation)
- [Evidencia para disputas](https://docs.stripe.com/disputes/visual-evidence)
- [Campos de evidencia](https://docs.stripe.com/api/disputes/update)
- [Advertencias tempranas de fraude](https://docs.stripe.com/api/radar/early_fraud_warnings)
- [Tarjetas de prueba](https://docs.stripe.com/testing)
