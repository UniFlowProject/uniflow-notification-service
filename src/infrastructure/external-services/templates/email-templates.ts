export class EmailTemplates {
  static deadlineReminder(data: {
    userName: string;
    taskTitle: string;
    dueDate: string;
    taskUrl: string;
  }) {
    const subject = `⏰ Recordatorio: "${data.taskTitle}" vence pronto`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .alert-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .task-info {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .task-info h2 {
      margin-top: 0;
      color: #667eea;
      font-size: 18px;
    }
    .due-date {
      font-size: 16px;
      color: #dc3545;
      font-weight: 600;
      margin: 10px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 UniFlow - Recordatorio de Tarea</h1>
    </div>

    <div class="content">
      <p>Hola <strong>${data.userName}</strong>,</p>

      <div class="alert-box">
        <strong>⏰ Tienes una tarea próxima a vencer</strong>
      </div>

      <div class="task-info">
        <h2>${data.taskTitle}</h2>
        <div class="due-date">
          📅 Vence: ${data.dueDate}
        </div>
      </div>

      <p>No olvides completar tu tarea antes de la fecha límite para mantener tu progreso al día.</p>

      <div style="text-align: center;">
        <a href="${data.taskUrl}" class="cta-button">
          Ver Tarea →
        </a>
      </div>

      <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
        💡 <em>Tip: Organiza tu tiempo y evita dejar todo para el último momento.</em>
      </p>
    </div>

    <div class="footer">
      <p>Este es un mensaje automático de UniFlow.</p>
      <p>Si tienes problemas, contacta a soporte@uniflow.fabian-vargas.com</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hola ${data.userName},

⏰ RECORDATORIO: Tienes una tarea próxima a vencer

Tarea: ${data.taskTitle}
Vence: ${data.dueDate}

Ver tarea: ${data.taskUrl}

---
UniFlow - Sistema de Gestión Académica
    `.trim();

    return { subject, html, text };
  }

  static taskCreated(data: {
    userName: string;
    taskTitle: string;
    subjectName: string;
    dueDate: string;
    taskUrl: string;
  }) {
    const subject = `📋 Nueva tarea: "${data.taskTitle}"`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .task-card {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .subject-badge {
      display: inline-block;
      background-color: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Nueva Tarea Asignada</h1>
    </div>

    <div class="content">
      <p>Hola <strong>${data.userName}</strong>,</p>

      <p>Se ha creado una nueva tarea en tu materia:</p>

      <div class="task-card">
        <span class="subject-badge">${data.subjectName}</span>
        <h2 style="margin: 10px 0; color: #333;">${data.taskTitle}</h2>
        <p style="color: #6c757d; margin: 5px 0;">
          📅 Fecha límite: <strong>${data.dueDate}</strong>
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${data.taskUrl}" class="cta-button">
          Ver Detalles →
        </a>
      </div>
    </div>

    <div class="footer">
      <p>UniFlow - Sistema de Gestión Académica</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hola ${data.userName},

📋 NUEVA TAREA ASIGNADA

Materia: ${data.subjectName}
Tarea: ${data.taskTitle}
Fecha límite: ${data.dueDate}

Ver detalles: ${data.taskUrl}

---
UniFlow
    `.trim();

    return { subject, html, text };
  }

  static generic(data: {
    userName: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    const subject = data.title;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 ${data.title}</h1>
    </div>

    <div class="content">
      <p>Hola <strong>${data.userName}</strong>,</p>

      <p>${data.message}</p>

      ${
        data.actionUrl
          ? `
      <div style="text-align: center;">
        <a href="${data.actionUrl}" class="cta-button">
          ${data.actionText || 'Ver Más'} →
        </a>
      </div>
      `
          : ''
      }
    </div>

    <div class="footer">
      <p>UniFlow - Sistema de Gestión Académica</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hola ${data.userName},

${data.title}

${data.message}

${data.actionUrl ? `Ver más: ${data.actionUrl}` : ''}

---
UniFlow
    `.trim();

    return { subject, html, text };
  }

  static resolve(
    user: { getName(): string },
    notification: {
      getActionUrl(): string | undefined;
      getTaskId(): string | undefined;
      getType(): { getValue(): string };
      getTitle(): string;
      getMessage(): string;
    },
    frontendUrl: string,
  ) {
    const taskUrl =
      notification.getActionUrl() ||
      `${frontendUrl}/tasks/${notification.getTaskId()}`;

    const notificationType = notification.getType().getValue();
    if (notificationType === 'DEADLINE_REMINDER') {
      return EmailTemplates.deadlineReminder({
        userName: user.getName(),
        taskTitle: notification.getTitle(),
        dueDate: 'Próximamente',
        taskUrl,
      });
    } else if (notificationType === 'TASK_CREATED') {
      return EmailTemplates.taskCreated({
        userName: user.getName(),
        taskTitle: notification.getTitle(),
        subjectName: 'Tu materia',
        dueDate: 'Por definir',
        taskUrl,
      });
    } else {
      return EmailTemplates.generic({
        userName: user.getName(),
        title: notification.getTitle(),
        message: notification.getMessage(),
        actionUrl: taskUrl,
        actionText: 'Ver Detalles',
      });
    }
  }
}
