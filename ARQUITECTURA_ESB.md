# Arquitectura del ESB - Enterprise Service Bus

## Vista General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND BOOKING-MVC                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Header    │  │  SearchBar  │  │   Filters   │  │    Cart     │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                 │                 │           │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴──────┐  │
│  │                     CONTROLLERS                                     │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐      │  │
│  │  │   Home    │  │  Results  │  │   Detail  │  │   Cart    │      │  │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘      │  │
│  └────────┼──────────────┼──────────────┼──────────────┼─────────────┘  │
│           │              │              │              │                 │
│  ┌────────┴──────────────┴──────────────┴──────────────┴─────────────┐  │
│  │                         SERVICES                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  search.service.ts                                           │  │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │  esb.adapter.ts ← INTEGRACIÓN CON ESB                  │  │  │  │
│  │  │  └────────────────┬───────────────────────────────────────┘  │  │  │
│  │  └───────────────────┼──────────────────────────────────────────┘  │  │
│  └────────────────────────┼──────────────────────────────────────────────┘
└────────────────────────────┼──────────────────────────────────────────────┘
                             │
                             │ HTTP/SOAP
                             │
┌────────────────────────────┼──────────────────────────────────────────────┐
│                            ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    ESB - ENTERPRISE SERVICE BUS                   │   │
│  │                         (esb/index.ts)                            │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                             │
│  ┌──────────────────────────┼───────────────────────────────────────┐   │
│  │              ORCHESTRATION LAYER (orchestration/)                │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │  ESBOrchestrator                                          │  │   │
│  │  │  • buscarServicios() - Búsqueda unificada                 │  │   │
│  │  │  • obtenerDetalleServicio() - Detalles                    │  │   │
│  │  │  • verificarDisponibilidad() - Validación                 │  │   │
│  │  │  • cotizarReserva() - Cotización                          │  │   │
│  │  │  • crearPreReserva() - Bloqueo temporal                   │  │   │
│  │  │  • confirmarReserva() - Confirmación                      │  │   │
│  │  │  • cancelarReservaIntegracion() - Cancelación             │  │   │
│  │  └───────────────────────┬───────────────────────────────────┘  │   │
│  └──────────────────────────┼───────────────────────────────────────┘   │
│                             │                                             │
│         ┌───────────────────┼───────────────────┐                        │
│         │                   │                   │                        │
│         ▼                   ▼                   ▼                        │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐           │
│  │  BLL LAYER  │   │  DAL LAYER  │   │   GATEWAY LAYER     │           │
│  │   (bll/)    │   │   (dal/)    │   │     (gateway/)      │           │
│  └─────────────┘   └─────────────┘   └─────────────────────┘           │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ BUSINESS LOGIC LAYER                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │  │
│  │  │UsuarioService   │  │ReservaService   │  │  PagoService    │  │  │
│  │  │• Validaciones   │  │• Reglas negocio │  │• Procesamiento  │  │  │
│  │  │• CRUD usuarios  │  │• Gestión reserva│  │• Autorizaciones │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ DATA ACCESS LAYER (Repositorios In-Memory)                        │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐│  │
│  │  │  Usuario   │ │  Reserva   │ │   Pago     │ │   Servicio     ││  │
│  │  │ Repository │ │ Repository │ │ Repository │ │   Repository   ││  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────┘│  │
│  │  ┌────────────┐ ┌────────────┐                                   │  │
│  │  │DetalleRes. │ │PreReserva  │                                   │  │
│  │  │ Repository │ │ Repository │                                   │  │
│  │  └────────────┘ └────────────┘                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ WEB SERVICES GATEWAY (Adaptadores SOAP)                           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │  │
│  │  │ HotelAdapter    │  │ FlightAdapter   │  │   CarAdapter    │  │  │
│  │  │ • buscarHoteles │  │ • buscarVuelos  │  │ • buscarAutos   │  │  │
│  │  │ • getDetalle    │  │ • getDetalle    │  │ • getDetalle    │  │  │
│  │  │ • verificarDisp.│  │ • verificarDisp.│  │ • verificarDisp.│  │  │
│  │  │ • preReserva    │  │ • preReserva    │  │ • preReserva    │  │  │
│  │  │ • confirmar     │  │ • confirmar     │  │ • confirmar     │  │  │
│  │  │ • cancelar      │  │ • cancelar      │  │ • cancelar      │  │  │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │  │
│  │           │                    │                    │            │  │
│  │  ┌────────┴────────────────────┴────────────────────┴────────┐  │  │
│  │  │              SoapClient (Cliente base)                     │  │  │
│  │  │  • Manejo de envelopes SOAP                               │  │  │
│  │  │  • Parseo de XML                                          │  │  │
│  │  │  • Manejo de errores SOAP Fault                           │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ UTILS (Utilidades)                                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │  │
│  │  │ soap-utils.ts│  │  config.ts   │  │   ESBLogger          │    │  │
│  │  │• escapeXml   │  │• endpoints   │  │• Registro eventos    │    │  │
│  │  │• createEnv   │  │• timeouts    │  │• Auditoría           │    │  │
│  │  │• parseXML    │  │• namespaces  │  │• Debugging           │    │  │
│  │  │• retryLogic  │  │• retry config│  │                      │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────┬─────────────────────────────────┘
                                         │
                                         │ SOAP/XML
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        ▼                                ▼                                ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│  HOTEL SOAP   │              │  FLIGHT SOAP  │              │   CAR SOAP    │
│   SERVICE     │              │    SERVICE    │              │    SERVICE    │
│ ┌───────────┐ │              │ ┌───────────┐ │              │ ┌───────────┐ │
│ │ Amigo 1   │ │              │ │ Amigo 2   │ │              │ │ Amigo 3   │ │
│ │ Hotel API │ │              │ │Flight API │ │              │ │  Car API  │ │
│ └───────────┘ │              │ └───────────┘ │              │ └───────────┘ │
│               │              │               │              │               │
│ • buscarHoteles()           │ • buscarVuelos()            │ • buscarAutos() │
│ • getDetalleHotel()         │ • getDetalleFlight()        │ • getDetalleAuto│
│ • verificarDisp()           │ • verificarDisp()           │ • verificarDisp()
│ • crearPreReserva()         │ • crearPreReserva()         │ • crearPreReserva
│ • confirmarReserva()        │ • confirmarReserva()        │ • confirmarReserva
│ • cancelarReserva()         │ • cancelarReserva()         │ • cancelarReserva
└───────────────┘              └───────────────┘              └───────────────┘
```

## Flujo de Datos: Búsqueda de Servicios

```
Usuario → SearchBar → HomeController → search.service → esb.adapter 
                                                             │
                                                             ▼
                                                        ESB.buscarServicios()
                                                             │
                                                             ▼
                                                      ESBOrchestrator
                                                             │
                              ┌──────────────────────────────┼──────────────────────────────┐
                              │                              │                              │
                              ▼                              ▼                              ▼
                      hotelAdapter                   flightAdapter                   carAdapter
                      .buscarHoteles()              .buscarVuelos()                .buscarAutos()
                              │                              │                              │
                              ▼                              ▼                              ▼
                      Hotel SOAP Service            Flight SOAP Service             Car SOAP Service
                      (Amigo 1)                     (Amigo 2)                       (Amigo 3)
                              │                              │                              │
                              └──────────────────────────────┼──────────────────────────────┘
                                                             │
                                                             ▼
                                                  Resultados unificados
                                                             │
                                                             ▼
                                                     Guardar en cache
                                                     (servicioRepository)
                                                             │
                                                             ▼
                                                  Convertir a formato frontend
                                                             │
                                                             ▼
                                                     ResultsView
                                                     (Mostrar al usuario)
```

## Flujo de Reserva Completa

```
1. BÚSQUEDA
   Usuario busca → ESB.buscarServicios() → Muestra resultados

2. SELECCIÓN
   Usuario selecciona servicio → ESB.obtenerDetalleServicio() → Muestra detalles

3. VERIFICACIÓN
   Usuario agrega al carrito → ESB.verificarDisponibilidad() → Confirma disponible

4. COTIZACIÓN
   Usuario revisa carrito → ESB.cotizarReserva() → Muestra precio total

5. PRE-RESERVA
   Usuario inicia checkout → ESB.crearPreReserva() → Bloquea por 30 min

6. PAGO
   Usuario ingresa tarjeta → pagoService.crearPago() → Procesa pago

7. CONFIRMACIÓN
   Pago exitoso → ESB.confirmarReserva() → Confirma en SOAP services

8. FINALIZACIÓN
   Muestra confirmación → Envía email → Usuario recibe voucher
```

## Modelos de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ENTIDADES PRINCIPALES                        │
└─────────────────────────────────────────────────────────────────────┘

Usuario                     Reserva                      Pago
┌──────────────┐           ┌──────────────┐            ┌──────────────┐
│ idUsuario    │           │ idReserva    │            │ idPago       │
│ nombre       │           │ idUsuario    │◄───────┐   │ idReserva    │
│ apellido     │           │ fechaReserva │        │   │ monto        │
│ email        │◄──────────┤ estado       │        └───┤ metodoPago   │
│ telefono     │           │ totalPrice   │            │ estado       │
│ activo       │           │ detalles[]   │            │ transaccionId│
└──────────────┘           └──────┬───────┘            └──────────────┘
                                  │
                                  │
                           ┌──────▼───────┐
                           │DetalleReserva│
                           ├──────────────┤
                           │ tipoServicio │──┐
                           │ idServicio   │  │
                           │ cantidad     │  │
                           │ precioUnit   │  │
                           │ subtotal     │  │
                           └──────────────┘  │
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼                              ▼                              ▼
       ┌─────────────┐              ┌──────────────┐              ┌──────────────┐
       │   Hotel     │              │   Flight     │              │     Car      │
       ├─────────────┤              ├──────────────┤              ├──────────────┤
       │ hotelId     │              │ flightId     │              │ carId        │
       │ nombre      │              │ origin       │              │ marca        │
       │ ciudad      │              │ destination  │              │ modelo       │
       │ roomType    │              │ airline      │              │ category     │
       │ checkIn     │              │ flightNumber │              │ pickupOffice │
       │ checkOut    │              │ departureTime│              │ dropoffOffice│
       │ pricePerNight              │ price        │              │ pricePerDay  │
       └─────────────┘              └──────────────┘              └──────────────┘
```

---

**📌 Nota**: Este diagrama representa la arquitectura completa implementada en tu proyecto `booking-mvc`.
