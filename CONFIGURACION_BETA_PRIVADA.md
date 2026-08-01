# Configuracion de la beta privada

## Objetivo

La aplicacion seguira usando un unico enlace, pero el panel quedara bloqueado
hasta que el usuario tenga una cuenta autorizada. Cada cuenta tendra sus propios
datos y no podra leer los de otra persona.

## Modelo elegido

- Acceso por invitacion privada: Antonio crea y activa cada cuenta.
- La pantalla publica no permite registros abiertos.
- Antonio administra las cuentas autorizadas.
- La persona crea su propia contrasena desde el enlace de invitacion. Antonio no
  conoce ni almacena contrasenas de usuarios.
- El acceso se puede revocar sin borrar el historial del resto de usuarios.
- El enlace se puede reenviar, pero una persona sin cuenta autorizada solo vera
  la pantalla de acceso.

## Flujo de usuario

1. Antonio envia una invitacion al correo del probador desde Supabase.
2. El probador abre el enlace y crea su propia contrasena en Linea Constructiva.
3. Antonio activa la cuenta si no quedo activa durante la invitacion.
4. El probador entra en su panel personal desde PC o movil.
5. Si olvida la contrasena, solicita un enlace de recuperacion.
6. Si Antonio revoca el acceso, el siguiente inicio de sesion queda bloqueado.

## Datos y permisos

Cada registro llevara un `user_id`. Las reglas del backend permitiran leer y
modificar unicamente los registros cuyo `user_id` coincida con la cuenta activa.
La cuenta de Antonio tendra el rol de administrador para invitar, bloquear y
revisar usuarios, pero no tendra acceso a las contrasenas.

## Migracion de los datos actuales

1. Mantener una copia de seguridad del almacenamiento local de Antonio.
2. Crear la cuenta de Antonio como primera cuenta autorizada.
3. Importar sus datos locales a su `user_id`.
4. Comprobar dashboard, agenda, habitos, areas y balances.
5. Activar invitaciones solo despues de verificar la importacion.

No se publicara la beta con usuarios reales hasta que esta migracion y las
reglas de aislamiento hayan sido probadas con dos cuentas distintas.

## Infraestructura pendiente

El proyecto Supabase ya esta creado y contiene autenticacion, base de datos y
reglas de acceso. La aplicacion reconoce tanto enlaces de invitacion como de
recuperacion y abre la creacion de contrasena. El proveedor de correo gratuito
de Supabase solo sirve para pruebas y tiene un limite muy bajo. Antes de invitar
usuarios reales hay que configurar SMTP propio, por ejemplo con Hostinger,
Resend o Brevo.

Nunca se debe compartir la clave secreta de administrador, la contrasena de la
base de datos, las credenciales SMTP ni contrasenas de usuarios.

## Criterio de lanzamiento

La beta privada no se considera lista hasta verificar:

- un usuario autorizado puede entrar desde PC y movil;
- un usuario no autorizado queda fuera;
- cada usuario ve solo sus propios registros;
- revocar una cuenta impide volver a entrar;
- actualizar la aplicacion no borra datos;
- existe copia de seguridad y recuperacion.
