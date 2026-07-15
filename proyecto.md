Actúa como un Arquitecto de Software Senior, Product Owner, Analista de Sistemas, UX/UI Designer, Arquitecto de Base de Datos, Backend Developer Senior, Frontend Developer Senior, DevOps Engineer y Especialista en Seguridad.

Quiero desarrollar un SaaS (Software as a Service) profesional para la administración de institutos educativos, principalmente orientado al mercado boliviano.

NO es una plataforma educativa (LMS).

NO habrá portal para estudiantes.

NO habrá portal para docentes.

El sistema será exclusivamente ADMINISTRATIVO.

==================================================================
OBJETIVO DEL SOFTWARE
==================================================================

El sistema permitirá administrar completamente un instituto desde un solo lugar.

Debe servir para:

- Institutos Preuniversitarios
- Institutos de Idiomas
- Institutos Técnicos
- Academias
- Centros de Capacitación
- Escuelas de Música
- Cualquier centro educativo privado

El sistema será SaaS Multi-Tenant.

Cada instituto tendrá completamente aislada su información.

Un instituto jamás podrá visualizar datos de otro instituto.

==================================================================
TIPO DE SISTEMA
==================================================================

SaaS ERP Administrativo

Arquitectura Multi Tenant

Cloud Ready

Escalable

Modular

Seguro

Profesional

==================================================================
USUARIOS DEL SISTEMA
==================================================================

SUPER ADMIN (Propietario del SaaS)

Este usuario administra toda la plataforma.

Puede:

- Ver todos los institutos
- Crear institutos
- Suspender institutos
- Eliminar institutos
- Cambiar planes
- Ver ingresos
- Ver pagos
- Ver cantidad de estudiantes
- Ver estadísticas globales
- Gestionar suscripciones
- Configurar el sistema
- Ver auditoría global
- Administrar soporte

====================================================

OWNER (Dueño del Instituto)

Es el propietario del instituto.

Puede administrar únicamente SU instituto.

Tiene acceso completo a:

Dashboard

Sucursales

Estudiantes

Cursos

Inscripciones

Docentes

Caja

Pagos

Mensualidades

Reportes

Usuarios

Configuraciones

Auditoría

====================================================

SECRETARIA

Es el usuario que más utilizará el sistema.

En Bolivia normalmente cumple también funciones de:

Recepcionista

Caja

Cobros

Atención al estudiante

Registro de estudiantes

Inscripciones

Control de pagos

Debe poder:

Registrar estudiantes

Editar estudiantes

Buscar estudiantes

Inscribir estudiantes

Registrar pagos

Cobrar mensualidades

Imprimir recibos

Controlar caja

Registrar gastos menores

Consultar historial del estudiante

Consultar cursos

Consultar horarios

Consultar docentes

Generar reportes básicos

NO podrá:

Eliminar información crítica

Modificar configuraciones

Ver auditoría

Gestionar usuarios

==================================================================
DOCENTES
==================================================================

Los docentes NO utilizarán el sistema.

Solo serán registrados.

Información:

Nombre

CI

Celular

Especialidad

Materias

Estado

Fecha ingreso

Observaciones

==================================================================
ESTUDIANTES
==================================================================

Cada estudiante tendrá:

CI

Código interno

Nombre

Apellido

Fecha nacimiento

Sexo

Teléfono

WhatsApp

Correo

Dirección

Foto

Tutor

Teléfono tutor

Universidad objetivo

Carrera objetivo

Estado

Activo

Retirado

Congelado

Egresado

Fecha inscripción

Observaciones

Historial completo

==================================================================
CURSOS
==================================================================

Cada curso tendrá:

Nombre

Modalidad

Mensualidad

Costo inscripción

Duración

Turno

Horario

Docente

Sucursal

Capacidad

Estado

==================================================================
MATERIAS
==================================================================

Cada curso puede tener varias materias.

Ejemplo

Matemáticas

Física

Química

Lenguaje

Historia

Biología

Inglés

==================================================================
HORARIOS
==================================================================

Control completo de horarios.

No permitir conflictos.

No permitir que un docente tenga dos clases al mismo tiempo.

No permitir dos cursos en el mismo aula.

==================================================================
AULAS
==================================================================

Nombre

Capacidad

Ubicación

Estado

==================================================================
INSCRIPCIONES
==================================================================

Proceso:

Registrar estudiante

↓

Seleccionar curso

↓

Seleccionar turno

↓

Registrar inscripción

↓

Generar deuda inicial

↓

Emitir comprobante

==================================================================
MENSUALIDADES
==================================================================

Cada estudiante tendrá mensualidades.

Estados

Pendiente

Pagado

Parcial

Vencido

Exonerado

Debe permitir:

Descuentos

Becas

Recargos

Promociones

==================================================================
PAGOS
==================================================================

Métodos

Efectivo

QR

Transferencia

Tarjeta

Debe registrar

Monto

Fecha

Hora

Usuario

Caja

Sucursal

Observaciones

Debe generar recibo.

==================================================================
CAJA
==================================================================

La caja será uno de los módulos principales.

Debe permitir:

Apertura de caja

Cierre de caja

Saldo inicial

Ingresos

Egresos

Gastos

Saldo final

Movimientos

Arqueo

Historial

Cada movimiento debe indicar:

Usuario

Hora

Sucursal

Tipo

Monto

Descripción

No debe permitirse modificar movimientos ya confirmados.

Toda modificación debe quedar auditada.

==================================================================
GASTOS
==================================================================

Registrar

Servicios

Papelería

Publicidad

Limpieza

Sueldos

Internet

Electricidad

Otros

==================================================================
SUCURSALES
==================================================================

Un instituto puede tener varias sucursales.

Cada sucursal tendrá:

Nombre

Dirección

Teléfono

Administrador

Estado

Cada estudiante pertenece a una sucursal.

Cada curso pertenece a una sucursal.

Cada caja pertenece a una sucursal.

==================================================================
REPORTES
==================================================================

Dashboard

Ingresos diarios

Ingresos mensuales

Ingresos anuales

Morosos

Mensualidades vencidas

Estudiantes activos

Cursos llenos

Cursos con cupos

Caja diaria

Caja mensual

Gastos

Ganancias

Docentes

Inscripciones

Todo filtrable por:

Fecha

Sucursal

Curso

Usuario

==================================================================
DASHBOARD
==================================================================

Mostrar:

Ingresos del día

Pagos pendientes

Mensualidades vencidas

Cursos activos

Estudiantes inscritos

Gráficos

Comparativas

Alertas

==================================================================
AUDITORÍA
==================================================================

Registrar absolutamente todo.

Ejemplo:

Usuario

Acción

Fecha

Hora

IP

Sucursal

Tabla afectada

Registro afectado

Valor anterior

Valor nuevo

==================================================================
NOTIFICACIONES
==================================================================

Recordatorios

Mensualidades vencidas

Cursos próximos

Caja pendiente de cerrar

==================================================================
BACKUP
==================================================================

Respaldos automáticos

Restauración

Exportación

==================================================================
SEGURIDAD
==================================================================

JWT

Refresh Token

Roles

Permisos

Hash de contraseñas

Validaciones

Rate Limit

Logs

HTTPS

Auditoría

==================================================================
ARQUITECTURA
==================================================================

Frontend

React

TypeScript

Tailwind CSS

React Router

TanStack Query

Axios

Backend

Node.js

Express

Arquitectura por módulos

Controller

Service

Repository

DTO

Validator

Middleware

Database

PostgreSQL

ORM

Prisma

==================================================================
ESTRUCTURA DEL BACKEND
==================================================================

src/

modules/

auth

users

roles

permissions

branches

students

teachers

courses

subjects

classrooms

schedules

enrollments

payments

monthly-payments

cash-register

expenses

dashboard

reports

audit

notifications

settings

subscriptions

tenants

shared/

middlewares/

utils/

config/

prisma/

==================================================================
MULTI TENANT
==================================================================

Toda tabla deberá contener:

tenant_id

Nunca permitir consultas sin tenant_id.

Toda la seguridad debe garantizar aislamiento total.

==================================================================
CALIDAD DEL CÓDIGO
==================================================================

Aplicar principios:

SOLID

Clean Architecture

Clean Code

DRY

KISS

YAGNI

Repository Pattern

Service Layer Pattern

Dependency Injection cuando sea necesario

==================================================================
OBJETIVO FINAL
==================================================================

Quiero construir un ERP SaaS moderno, escalable y profesional para institutos educativos, pensado inicialmente para Bolivia pero adaptable a cualquier país.

Cada propuesta debe incluir:

- Análisis funcional.
- Reglas de negocio.
- Casos de uso.
- Diseño de base de datos.
- Diagrama ER.
- Arquitectura.
- APIs REST.
- Validaciones.
- Seguridad.
- Flujo de usuarios.
- Diseño de interfaces.
- Optimización.
- Escalabilidad.
- Buenas prácticas.
- Estrategias de despliegue.
- Pruebas.
- Documentación técnica.

No omitas ningún detalle y prioriza soluciones listas para producción, fáciles de mantener y escalables.