# Entrega del informe vocacional por WhatsApp

Esta nota documenta la viabilidad técnica y de consentimiento para enviar el informe PDF a un número informado durante el test. Las fuentes se verificaron el **19 de agosto de 2026**.

| Aspecto | Evidencia oficial | Implicación para el IES N.° 11 |
|---|---|---|
| Consentimiento | Meta exige que la persona haya entregado su número y dado un consentimiento claro para recibir comunicaciones del negocio. El aviso debe identificar a la institución. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in) | El formulario debe incluir una casilla **optativa y separada**, no premarcada, que indique que el estudiante autoriza al IES N.° 11 a enviarle su informe por WhatsApp. |
| Envío de PDF | La plataforma oficial admite mensajes de tipo documento; el PDF aparece como un archivo descargable dentro del chat. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages) | Es técnicamente posible entregar un informe PDF, pero debe generarse y almacenarse temporalmente en un servidor antes del envío. |
| Ventana de atención | Los mensajes libres se permiten en las 24 horas posteriores a que la persona escriba o llama al número oficial. Fuera de esa ventana se debe usar una plantilla aprobada. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages) | El envío inmediato desde el test requiere una plantilla de utilidad aprobada, salvo que el participante haya iniciado antes una conversación con el WhatsApp institucional. |
| Integración necesaria | La plataforma oficial funciona con una cuenta comercial de WhatsApp, un número empresarial, credenciales de API y webhooks para estados de entrega. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform) | No hay una integración de WhatsApp configurada actualmente. Antes de implementarla se requieren las credenciales oficiales y la aprobación institucional del flujo de consentimiento. |

> Alternativa sin credenciales: el informe se descarga de inmediato en el dispositivo y el visitante puede abrir una conversación con el IES N.° 11 mediante el botón de contacto. Esta alternativa no transmite ni almacena el PDF ni datos personales fuera del dispositivo del estudiante.

